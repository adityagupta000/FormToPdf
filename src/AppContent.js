import React, { useState, useEffect } from "react";
import TabNavigation from "./components/common/TabNavigation";
import InputForm from "./components/form/InputForm";
import ReportOutput from "./components/report/ReportOutput";
import AdminPanel from "./components/admin/AdminPanel";
import SettingsPanel from "./components/settings/SettingsPanel";
import { useReportGeneration } from "./hooks/useReportGeneration";
import { AnimatePresence, motion } from "framer-motion";

const LOCAL_TAB_KEY = "activeTab";

const AppContent = () => {
  // ✅ Load initial tab from localStorage if available
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(LOCAL_TAB_KEY) || "form";
  });

  const { reportData, generateReport } = useReportGeneration();

  // ✅ Sync tab state to localStorage on every change
  useEffect(() => {
    localStorage.setItem(LOCAL_TAB_KEY, activeTab);
  }, [activeTab]);

  const handleGenerateReport = (formData) => {
    generateReport(formData);
  };

  const tabTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen dark:bg-gray-900">
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <AnimatePresence mode="wait">
        {activeTab === "form" && (
          <motion.div key="form" {...tabTransition}>
            <div className="flex flex-col md:flex-row h-screen desktop-layout">
              <InputForm
                onGenerateReport={handleGenerateReport}
                reportData={reportData}
              />
              <ReportOutput reportData={reportData} />
            </div>
          </motion.div>
        )}

        {activeTab === "admin" && (
          <motion.div key="admin" {...tabTransition}>
            <div className="p-6">
              <AdminPanel />
            </div>
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div key="settings" {...tabTransition}>
            <div className="p-6">
              <SettingsPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppContent;
