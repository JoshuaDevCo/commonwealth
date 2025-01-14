import Comment from 'client/scripts/models/Comment';
import { useFetchProfilesByAddressesQuery } from 'client/scripts/state/api/profiles';
import React from 'react';
import app from 'state';
import { ViewUpvotesDrawer } from './ViewUpvotesDrawer';

type ViewCommentUpvotesDrawerProps = {
  comment?: Comment<any>;
};

export const ViewCommentUpvotesDrawer = ({
  comment,
}: ViewCommentUpvotesDrawerProps) => {
  const reactors = comment?.reactions;
  const reactorAddresses = reactors?.map((t) => t.author);

  const { data: reactorProfiles } = useFetchProfilesByAddressesQuery({
    currentChainId: app.activeChainId(),
    profileAddresses: reactorAddresses,
    profileChainIds: [app.chain.id],
  });

  const reactorData = reactorProfiles?.map((profile) => {
    const reactor = reactors.find((r) => r.author === profile.address);

    return {
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      address: profile.address,
      updated_at: reactor?.updatedAt,
      voting_weight: reactor?.calculatedVotingWeight || 1,
    };
  });

  return (
    <ViewUpvotesDrawer
      contentBody={comment.text}
      header="Comment upvotes"
      reactorData={reactorData}
      author={app.chain.accounts.get(comment.author)}
      publishDate={comment.createdAt}
    />
  );
};
