<style>
    :not(pre) > code {
        color:#5d666d;
        background-color: #f1f1f1;
        padding: 4px;
        border-radius: 7px;
    }

    blockquote {
        border-color: #b3b9c5;
        background: #f6f7f9;
        padding-top: 1px;
        padding-bottom: 1px;
    }

    .hljs-attr {
        color: #569cd6 !important;
    }

    .hljs-string, .hljs-literal {
        color: #e28f3a !important;
    }
/* 
    code>div {
        background: #1a1919;
        padding: 7px;
        border-radius: 7px;
    } */

</style>

# Harrison Mitgang's Blog

*August 11, 2021*
## GitHub Action for JFrog Pipelines

-----

As an intern at JFrog, I've had a lot to learn. Not only was it my first time working for an established software company, but it was also my first exposure to devops, which was not a topic covered in my first two years of my undergraduate computer engineering degree at the University of British Columbia. In my first week, I spent most of my time learning how to use the different tools in the JFrog platform. Notably, I built a <abbr title="Continuous Integration and Continuous Delivery/Deployment">CI/CD</abbr> pipeline in [JFrog Pipelines](https://jfrog.com/pipelines/) that showcased the software development life cycle by building, testing, and promoting a basic Docker project (which was also new to me!).

Armed with my introductory experience with JFrog Pipelines, I was tasked to build a simple pipeline for an existing project which installed the project's dependencies and built and tested the latest commit. I finished this quickly and it worked well, showcasing just how easy building a useful CI pipeline can be. The motivation behind the pipeline, like many other CI pipelines, was to ensure that each new commit to the default branch did not fail the build. But there were three drawbacks to this model:

1. Once a commit is pushed/merged to this branch, it's too late. The code is already on the default branch! Ideally, the CI pipeline should execute on each pull request *into* the default branch, before it can fail the default branch's build.
2. Developers have to open JFrog Pipelines to see whether the pipeline passes or fails. This may only be an inconvenience for an internal project, but external contributors who don't have access to your JFrog platform cannot see the pipeline's status at all.
3. Pipelines cannot sync new branches automatically. The pipeline will only work for existing branches, or require manual interaction to sync the new branch.

Like any excited software developer, I immediately began thinking of ways to remedy these issues. I found that solutions to (1) and (2) are actually already provided by JFrog (after doing some investigation).

1. Pipeline's [GitRepo](https://www.jfrog.com/confluence/display/JFROG/GitRepo#:~:text=pullRequestCreate%C2%A0--%20(default%20is%20false)%20used%20to%20control%20whether%20the%20resource%20will%20be%20updated%20for%20pull%20request%20webhooks) resource provides a configuration that can trigger the pipeline when a PR is opened or updated. The pipeline will run the base ref's `pipelines.yml` (pipeline description file) using the head ref's source code. In this way, the merger can be sure that the proposed changes properly build. 
2. Pipelines provides a *utility function* that can send build status back to the git repository (GitHub included). This works but requires setup within Pipelines and cannot show status if the pipeline never even starts! Steps like DockerBuild and DockerPush also don't allow `onSuccess` and `onFailure` execution steps so you cannot run the utility function and thus cannot intuitively track if the step starts, passes, fails, or completes. If you are looking for a basic solution that works out of the box with Pipelines alone (no GitHub Action), see the [guide](https://www.jfrog.com/confluence/display/JFROG/Sending+Build+Status+to+Source+Control).

To solve Multi Branch syncing (3) and improve the behavior of tagging commits as pass or fail (2), I found that GitHub Actions would be the most portable solution. I wanted to build something that was easy for JFrog and JFrog's customers to setup and use.


### JFrog Pipelines Setup

I wanted this tool to work on any and all branches in the repository it was set up, regardless of new branches being created. For example, say a small team is working on a new feature. They create a new branch called `feature-xyz` and then delegate tasks within that feature. Alice creates a branch `feature-xyz-alice` and Bob creates `feature-xyz-bob`. Although `feature-xyz` may not be a mission critical branch, we want the feature to be working as well as possible so we want to check Alice's and Bob's changes before merging their PRs. Then, we want to make sure that the PR into the default branch also passes the build.

Multi Branch Pipelines to the rescue, allowing a single pipeline source to have different pipelines for each branch. The `feature-xyz` branch could have a pipeline that is different than the default branch's pipeline with tasks specific to the new feature (testing or otherwise). By triggering the pipeline on the `pullRequestCreate` event, Alice and Bob can ensure their pipeline passes before merging the pull request into `feature-xyz` and then again before merging into the default branch, which may have changed since the start of the feature's development. Our JFrog Pipeline resource yaml may look something like this:

```yaml
resources:
  - name: <resource name>
    type: GitRepo
    configuration:
      gitProvider: <GitHub integration>
      path: <repo name>
      branches:
        include: ^{{gitBranch}}$  # Prevent running same Pipeline twice
      buildOn:
        pullRequestCreate: true
      cancelPendingRunsOn:
        pullRequestUpdate: true  # Optional
```

Now each time a pull request is created or updated, the pipeline belonging to the base branch is executed using the code in the head branch.


### GitHub Action

Like I mentioned earlier, the two new challenges I had to overcome using GitHub actions were syncing new branches and checking pipeline status regardless of the pipeline's progress or steps. To break this down into distinct steps, I used GitHub Actions' [events](https://docs.github.com/en/actions/reference/events-that-trigger-workflows) which occur in a repository after pushing a commit, creating a PR, or creating a branch or tag. Events are then used to trigger a workflow which is a set of steps that perform some function.

You can write GitHub Actions either in JavaScript, with a Docker container, or with just bash steps. To keep things lightweight yet flexible, I went with JavaScript, and utilized [ncc](https://github.com/vercel/ncc) to compile the npm dependencies into one file.

#### The `create` Event

The [`create` event](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#create) triggers a workflow whenever a new branch or tag is created. Since we don't care about new tags, this is ignored in the JavaScript itself. When this event is triggered by a new branch, an API request is made to JFrog Pipelines to fetch and sync the newly created branch to the Multi Branch pipeline. In this way, whenever a new branch is pushed to/created in the repository, Pipelines can immediately start tracking the `pipelines.yml` file in that branch without the need for additional manual steps.


#### The `pull_request_target` Event

Since the pipeline is automatically triggered via webhook in Pipelines, the GitHub Action needs to check the pipeline's status associated with the PR's base branch (recall that the pipeline itself also triggers on the PR's base branch). There are actually two different pull request events that are triggered whenever a PR is created or updated: `pull_request` and `pull_request_target`. `pull_request_target` is triggered on the PR's base ref's workflow and has permissions to the repository's secrets while `pull_request` is triggered on the PR's head ref's workflow and does not have access to the repository's secrets when merging from a forked branch. Since we needed access to the repository secret's we used `pull_request_target`. (*Note*: there are [security concerns](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/) with this event which I will address later.) 

In order to poll the pipeline's status, we need to complete the following steps:
1. Get the `latestRunId` for the given branch from the `/api/v1/pipelines` endpoint.
2. Confirm pipelines is executing the correct commit. The commit sha in the GitHub Action's context payload (the commit that triggered the Action) is compared to the commit sha that triggered the pipeline to run. If they do not match, the Action fails.
3. Get system status codes. Pipelines uses system codes to state pipeline status. We get the codes using `/api/v1/systemCodes?group=status` and can use their friendly names (`success`, `processing`, `failed`, etc.).
4. Finally poll the `/api/v1/runs/<run id>` endpoint and extract the `statusCode`. We continue polling every 5 seconds while the status is one of `queued`, `processing`, `waiting`, `creating`, `online`, `ready`, or `pendingApproval`. The Action is successful once the status is `success` and fails if the status is *not* a valid in-progress or success state.

To make the system a bit more robust, rather than just using the standard `node-fetch` library, all API calls are wrapped with a function called `retryFetch` which will retry the request a number of times if the request fails for whatever reason.


### Security Concerns
**JFrog Pipelines**: When you set a Pipeline to build on `pullRequestCreate`, as required by this integration, Pipelines will run the base ref’s `pipelines.yml` but clone the head ref’s source code repository. This could lead to arbitrary code execution, even by forked branches. This is not specific to this GitHub Action, but should still be considered. Here is an example attack:

> The attacker can see `pipelines.yml`. Assume the pipeline is vulnerable to the attack and tests some source code by running a bash script (`script.sh`) that lives in the GitHub repository. The attacker, seeing this, can fork the branch, edit the `script.sh`, open a PR, and now arbitrarily execute code on the node pool machines. A command like `printenv` could expose secrets, and while they don’t have access to the logs, an attacker could send the secrets anywhere via web requests.

To keep your secrets secure from bad actors (if the source repository is public), it's important that your pipeline does *not* execute any untrusted code. 

**GitHub Actions**: Using the `pull_request_target` event uses the base ref’s secrets and workflows. This prevents an attacker from executing arbitrary workflows and exposing or using secrets. We want external contributors to use forks and then create a PR into the main project repository. To keep this secure, it is necessary to check that PR’s don’t change workflow files, and don’t maliciously change `pipelines.yml`. Perhaps, this could be automated using other Actions.

Also note: anyone with contributor (write access) to the repository can edit the `pipelines.yml` and Action workflow for their branch, as well as access the repository secrets.


### Other Alternatives
If you want similar behavior to this GitHub Action, but want an out of the box solution, here's an alternative:

Use the [`update_commit_status`](https://www.jfrog.com/confluence/display/JFROG/Pipelines+Utility+Functions#PipelinesUtilityFunctions-update-commit-statusupdate_commit_status) utility function mentioned at the beginning of this article. This can be used to update the status of the commit (either passing or failing) that triggered the Pipeline. If you use a similar `pipelines.yml` configuration as the one in this blog, you'll experience similar behavior: the base ref's pipeline will run using the head ref's code and commit sha. In this case, you would still need to be sure to sync any new branches before merging into them. (In the case of Alice and Bob, that just means the `feature_xyz` needs to be synced, perhaps manually, but not `feature_xyz_alice` or `feature_xyz_bob`.)

### Wrap up
This was a great project that taught me a lot about GitHub Actions and how useful CI pipelines can be. I learned some of the subtle behaviors in both GitHub Actions and JFrog Pipelines surrounding pull requests. I enjoyed thinking about how a potential bad actor could exploit this system and what I could do to remedy it as much as possible. I've really enjoyed my time at the JFrog Swamp and have learned so much. 

Check out and use the GitHub Action in the [<u>`hmitgang/jfrog-pipelines-gh-action`</u>](https://github.com/hmitgang/jfrog-pipelines-gh-action) repository!

