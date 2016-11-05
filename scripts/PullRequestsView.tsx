import { GitPullRequest, PullRequestStatus } from "TFS/VersionControl/Contracts";
import * as ReactDom from "react-dom";
import * as React from "react";
import * as Utils_Date from "VSS/Utils/Date";

class RequestRow extends React.Component<{ pullRequest: GitPullRequest }, void> {
    render() {
        const pr = this.props.pullRequest;

        const uri = VSS.getWebContext().host.uri;
        const project = VSS.getWebContext().project.name;
        const team = VSS.getWebContext().team.name;
        const url = `${uri}${project}/${team}/_git/${pr.repository.name}/pullrequest/${pr.pullRequestId}`;
        const targetName = pr.targetRefName.replace('refs/heads/', '');
        const createTime = Utils_Date.friendly(pr.creationDate);

        const approved = Boolean(pr.reviewers.find((reviewer) => reviewer.vote > 0))
        const rejected = Boolean(pr.reviewers.find((reviewer) => reviewer.vote < 0))
        const approvalStatus = rejected ? "Rejected" : approved ? "Approved" : "Awaiting approval";

        const reviewerImages = pr.reviewers.slice(0, 8).map((reviewer) =>
            <img style={{ display: "block-inline" }} src={reviewer.imageUrl} />
        );
        return (
            <tr className="pr-row">
                <td><img src={pr.createdBy.imageUrl} /></td>
                <td>
                    <a href={url} target={'_blank'}>{pr.title}</a>
                    <div>{pr.createdBy.displayName} requested #{pr.pullRequestId} into {targetName} {createTime}</div>
                </td>
                <td className="skinny-column">
                    {pr.status == PullRequestStatus.Active ? approvalStatus : PullRequestStatus[pr.status]}
                </td>
                <td className="skinny-column">
                    {pr.reviewers.length} {pr.reviewers.length == 1 ? "reviewer" : "reviewers"}
                </td>
                <td>
                    {reviewerImages}
                </td>
            </tr>
        );
    }
}
class RequestsView extends React.Component<{ pullRequests: GitPullRequest[] }, void> {
    render() {
        if (this.props.pullRequests.length == 0) {
            return (<div>No pull requests found</div>)
        }

        const rows = this.props.pullRequests.map((pullRequest) => (
            <RequestRow pullRequest={pullRequest} />
        ));
        return (
            <table>
                <tbody>
                    {rows}
                </tbody>
            </table>
        );
    }
}

export function renderResults(pullRequests: GitPullRequest[]) {
    const view = (<div></div>);
    ReactDom.render(
        <RequestsView pullRequests={pullRequests} />,
        document.getElementById("results")
    )
}