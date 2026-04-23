
import React, { useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { UserType } from '../types';
import UserDashboardContent from '../components/Dashboard/UserDashboardContent';
import { SellerDashboardContent } from '../components/Dashboard/SellerDashboardContent';
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate, useParams } = ReactRouterDOM as any;

const DashboardPage: React.FC = () => {
  const { currentUser, userType, isInitialAuthCheck, isAuthenticating } = useAppContext();
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = tab || (userType === UserType.USER ? 'library' : 'stats');

  useEffect(() => {
      if (!isInitialAuthCheck && !isAuthenticating && (userType === UserType.GUEST || !currentUser)) {
          navigate('/login');
      }
  }, [userType, currentUser, navigate, isInitialAuthCheck, isAuthenticating]);

  if (isInitialAuthCheck || isAuthenticating) {
    return (
        <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-200 rounded-full animate-spin" />
        </div>
    );
  }

  return (
    <>
      {userType === UserType.USER ? (
          <UserDashboardContent activeTab={activeTab} setActiveTab={(t) => navigate(`/dashboard/${t}`)} />
      ) : (
          <SellerDashboardContent activeTab={activeTab} setActiveTab={(t) => navigate(`/dashboard/${t}`)} />
      )}
    </>
  );
};

export default DashboardPage;
