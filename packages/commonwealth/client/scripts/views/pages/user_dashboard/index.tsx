import { notifyInfo } from 'controllers/app/notifications';
import { useBrowserAnalyticsTrack } from 'hooks/useBrowserAnalyticsTrack';
import useUserLoggedIn from 'hooks/useUserLoggedIn';
import { useCommonNavigate } from 'navigation/helpers';
import 'pages/user_dashboard/index.scss';
import React, { useEffect } from 'react';
import app, { LoginState } from 'state';
import { MixpanelPageViewEvent } from '../../../../../shared/analytics/types';
import DashboardActivityNotification from '../../../models/DashboardActivityNotification';
import { CWText } from '../../components/component_kit/cw_text';
import {
  CWTab,
  CWTabsRow,
} from '../../components/component_kit/new_designs/CWTabs';
import { Feed } from '../../components/feed';
import { DashboardCommunitiesPreview } from './dashboard_communities_preview';
import { fetchActivity } from './helpers';

export enum DashboardViews {
  ForYou = 'For You',
  Global = 'Global',
  Chain = 'Chain',
}

type UserDashboardProps = {
  type?: string;
};

const UserDashboard = (props: UserDashboardProps) => {
  const { type } = props;
  const { isLoggedIn } = useUserLoggedIn();

  const [activePage, setActivePage] = React.useState<DashboardViews>(
    DashboardViews.Global,
  );

  useBrowserAnalyticsTrack({
    payload: {
      event: MixpanelPageViewEvent.DASHBOARD_VIEW,
    },
  });

  const navigate = useCommonNavigate();

  const [scrollElement, setScrollElement] = React.useState(null);

  const loggedIn = app.loginState === LoginState.LoggedIn;

  useEffect(() => {
    if (!type) {
      navigate(`/dashboard/${loggedIn ? 'for-you' : 'global'}`);
    } else if (type === 'for-you' && !loggedIn) {
      navigate('/dashboard/global');
    }
  }, [loggedIn, navigate, type]);

  const subpage: DashboardViews =
    type === 'chain-events'
      ? DashboardViews.Chain
      : type === 'global'
      ? DashboardViews.Global
      : loggedIn
      ? DashboardViews.ForYou
      : DashboardViews.Global;

  React.useEffect(() => {
    if (!activePage || activePage !== subpage) {
      setActivePage(subpage);
    }
  }, [activePage, subpage]);

  return (
    <div ref={setScrollElement} className="UserDashboard" key={`${isLoggedIn}`}>
      <div className="dashboard-column">
        <div className="dashboard-header">
          <CWText type="h2" fontWeight="medium">
            Home
          </CWText>
          <CWTabsRow>
            <CWTab
              label={DashboardViews.ForYou}
              isSelected={activePage === DashboardViews.ForYou}
              onClick={() => {
                if (!loggedIn) {
                  notifyInfo(
                    'Sign in or create an account for custom activity feed',
                  );
                  return;
                }
                navigate('/dashboard/for-you');
              }}
            />
            <CWTab
              label={DashboardViews.Global}
              isSelected={activePage === DashboardViews.Global}
              onClick={() => {
                navigate('/dashboard/global');
              }}
            />
            <CWTab
              label={DashboardViews.Chain}
              isSelected={activePage === DashboardViews.Chain}
              onClick={() => {
                navigate('/dashboard/chain-events');
              }}
            />
          </CWTabsRow>
        </div>
        <>
          {activePage === DashboardViews.ForYou && (
            <Feed
              fetchData={() => fetchActivity(activePage)}
              noFeedMessage="Join some communities to see Activity!"
              onFetchedDataCallback={DashboardActivityNotification.fromJSON}
              customScrollParent={scrollElement}
            />
          )}
          {activePage === DashboardViews.Global && (
            <Feed
              fetchData={() => fetchActivity(activePage)}
              noFeedMessage="No Activity"
              onFetchedDataCallback={DashboardActivityNotification.fromJSON}
              customScrollParent={scrollElement}
            />
          )}
          {activePage === DashboardViews.Chain && (
            <Feed
              fetchData={() => fetchActivity(activePage)}
              noFeedMessage="Join some communities that have governance to see Chain Events!"
              onFetchedDataCallback={DashboardActivityNotification.fromJSON}
              customScrollParent={scrollElement}
              isChainEventsRow={true}
            />
          )}
        </>
      </div>
      <DashboardCommunitiesPreview />
    </div>
  );
};

export default UserDashboard;
