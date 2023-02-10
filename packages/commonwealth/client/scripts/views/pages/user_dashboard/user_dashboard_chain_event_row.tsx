import React from 'react';

import type { ChainInfo } from 'models';

import { ClassComponent, redraw } from 'mithrilInterop';

import type { ResultNode } from 'mithrilInterop';

import 'pages/user_dashboard/user_dashboard_chain_event_row.scss';
import type { IEventLabel } from '../../../../../../chain-events/src';
import { CWCommunityAvatar } from '../../components/component_kit/cw_community_avatar';
import { CWIcon } from '../../components/component_kit/cw_icons/cw_icon';
import type { IconName } from '../../components/component_kit/cw_icons/cw_icon_lookup';
import { CWText } from '../../components/component_kit/cw_text';
import { getClasses } from '../../components/component_kit/helpers';
import withRouter from 'navigation/helpers';

type UserDashboardChainEventRowAttrs = {
  blockNumber: number;
  chain: ChainInfo;
  label: IEventLabel;
};

export class UserDashboardChainEventRowComponent extends ClassComponent<UserDashboardChainEventRowAttrs> {
  view(vnode: ResultNode<UserDashboardChainEventRowAttrs>) {
    const { blockNumber, chain, label } = vnode.attrs;

    return (
      <div
        className={getClasses<{ isLink?: boolean }>(
          { isLink: !!label.linkUrl },
          'UserDashboardChainEventRow'
        )}
        onClick={() => {
          if (label.linkUrl) {
            this.setRoute(label.linkUrl);
          }
          redraw();
        }}
      >
        <div className="chain-event-icon-container">
          <CWIcon
            iconName={label.icon ? (label.icon as IconName) : 'element'}
            className={label.icon === 'delegate' ? 'delegate' : ''}
          />
        </div>
        <div className="chain-event-text-container">
          <div className="community-title">
            <CWCommunityAvatar community={chain} size="small" />
            <a
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.setRoute(`/${chain}`);
              }}
            >
              <CWText type="caption" fontWeight="medium">
                {chain?.name || 'Unknown chain'}
              </CWText>
            </a>
            <div className="dot">.</div>
            <CWText type="caption" fontWeight="medium" className="block">
              Block {blockNumber}
            </CWText>
          </div>
          <CWText className="row-top-text" fontWeight="bold">
            {label.heading}
          </CWText>
          <CWText type="caption" className="label">
            {label.label}
          </CWText>
        </div>
      </div>
    );
  }
}

export const UserDashboardChainEventRow = withRouter(
  UserDashboardChainEventRowComponent
);
