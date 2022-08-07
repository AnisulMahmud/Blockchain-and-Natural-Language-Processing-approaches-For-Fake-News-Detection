import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  CalendarIcon,
  ChartBarIcon,
  FolderIcon,
  InboxIcon,
  UsersIcon,
} from '@heroicons/react/outline';

const NavigationAdmin = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const navigation = [
        {
          name: 'Authenticate Evaluators',
          href: '/Verification',
          icon: UsersIcon,
          uid: 0,
        },
        { name: 'Add News', href: '/AddNews', icon: FolderIcon, uid: 1 },
        {
          name: 'Evaluator Registration',
          href: '/Registration',
          icon: ChartBarIcon,
          uid: 2,
        },
        { name: 'Verify News', href: '/Voting', icon: CalendarIcon, uid: 3 },
        { name: 'Outcome', href: '/Outcomes', icon: InboxIcon, uid: 4 },
      ]

  const handleSetActiveTab = () => {
    const pageIndex = navigation.findIndex(
      (item) => item.href === window.location.pathname
    );
    if (navigation[pageIndex]?.uid) {
      setActiveTab(navigation[pageIndex].uid);
    } else if (navigation[pageIndex]?.uid === 0) {
      setActiveTab(0);
    }
  };

  useEffect(() => {
    const width = window.innerWidth;
    if (width >= 769) setShowSidebar(true);
  }, []);

  useEffect(() => {
    handleSetActiveTab();
  }, [window.location.pathname]);

  return (
    <>
      {showSidebar ? (
        <button
          className="flex md:hidden text-4xl text-cyan-700 items-center cursor-pointer fixed right-5 top-5 z-50"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          x
        </button>
      ) : (
        <div>
          <svg
            onClick={() => setShowSidebar(!showSidebar)}
            className="fixed md:hidden z-30 flex items-center cursor-pointer left-10 top-6"
            fill="#1E88F7"
            viewBox="0 0 100 80"
            width="40"
            height="40"
          >
            <rect width="100" height="10"></rect>
            <rect y="30" width="100" height="10"></rect>
            <rect y="60" width="100" height="10"></rect>
          </svg>
          <h3 className="text-right text-4xl font-semibold p-5 border-b border-double ">
            <Link to="/">
              <i className="fab fa-hive text-cyan-700" />{' '}
              <span className="text-cyan-700">News Publisher</span>
            </Link>
          </h3>
        </div>
      )}

      <div
        className={`top-0 left-0 bg-sky-600 py-5 text-white fixed h-full z-40 ease-in-out duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-[100vw]'
        }`}
        style={{ minWidth: 250 }}
      >
        <h3
          className={`text-3xl font-semibold text-white border-b border-double flex items-center justify-center pb-5 ${
            showSidebar ? 'block' : 'hidden'
          }`}
        >
          <Link to="/">
            <i className="fab fa-hive" /> News Publisher{' '}
          </Link>
        </h3>
        <div className="mt-10 p-2 flex flex-col">
          {navigation.map((item, index) => (
            <div
              key={Math.random()}
              className={`text-md p-3 mt-2 ${
                activeTab === index
                  ? 'bg-cyan-900 text-white'
                  : 'text-gray-300 hover:bg-cyan-700 hover:text-white'
              }`}
              onClick={handleSetActiveTab}
            >
              <Link to={item.href} className="flex">
                <item.icon
                  className="mr-4 flex-shrink-0 h-6 w-6 text-cyan-300"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NavigationAdmin;
