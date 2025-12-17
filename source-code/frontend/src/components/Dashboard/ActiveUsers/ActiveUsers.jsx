import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiUsers, FiUser } from "react-icons/fi";
import { HiOutlineStatusOnline } from "react-icons/hi";
import moment from "moment";
import { loadActiveUsers } from "../../../redux/rtk/features/dashboard/dashboardSlice";

const ActiveUsers = () => {
  const dispatch = useDispatch();
  const { activeUsers, totalActiveUsers, activeUsersLoading } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(loadActiveUsers());
    
    // Refresh every 2 minutes to keep the list updated
    const interval = setInterval(() => {
      dispatch(loadActiveUsers());
    }, 120000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "?";
  };

  const getRandomColor = (id) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
    ];
    return colors[id % colors.length];
  };

  if (activeUsersLoading && !activeUsers) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 p-4 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 transition-all duration-300 hover:shadow-2xl animate-scaleIn overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100/80 px-4 py-3 dark:border-slate-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500 text-white shadow-lg">
            <FiUsers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Currently Working
            </h3>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Active Staff Members
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {totalActiveUsers || 0} Online
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[320px] overflow-y-auto custom-scrollbar">
        {activeUsers && activeUsers.length > 0 ? (
          <div className="space-y-3">
            {activeUsers.map((user, index) => (
              <Link
                key={user.id}
                to={`/admin/hr/staffs/${user.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-all duration-200 group cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Avatar */}
                <div className="relative">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-11 w-11 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md"
                    />
                  ) : (
                    <div
                      className={`h-11 w-11 rounded-full ${getRandomColor(
                        user.id
                      )} flex items-center justify-center text-white font-semibold text-sm border-2 border-white dark:border-slate-700 shadow-md`}
                    >
                      {getInitials(user.firstName, user.lastName)}
                    </div>
                  )}
                  {/* Online indicator */}
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-700"></span>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate">
                      {user.designation || user.role || "Staff"}
                    </span>
                    {user.store && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="truncate">{user.store.name}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <HiOutlineStatusOnline className="h-3 w-3" />
                    Online
                  </span>
                  {user.loginTime && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {moment(user.loginTime).fromNow()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
            <FiUser className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">No staff currently online</p>
            <p className="text-xs">Active staff will appear here</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {activeUsers && activeUsers.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 bg-slate-50/50 dark:bg-slate-800/30">
          <Link
            to="/admin/hr/staffs"
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center justify-center gap-1 transition-colors"
          >
            View All Staff →
          </Link>
        </div>
      )}
    </div>
  );
};

export default ActiveUsers;
