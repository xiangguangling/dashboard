import { useState, useCallback } from 'react';
import { useData } from './hooks/useData';
import Header from './components/Header';
import NavigationBar, { type TabId } from './components/NavigationBar';
import OverviewPager from './components/OverviewPager';
import RegionalGrid from './components/RegionalGrid';
import SafetyGrid from './components/SafetyGrid';
import FacilityGrid from './components/FacilityGrid';
import FacultyGrid from './components/FacultyGrid';
import Particles from './components/Particles';
import LoadingScreen from './components/LoadingScreen';

const gridTabs: TabId[] = ['regional', 'safety', 'facility', 'faculty'];

export default function App() {
  const { data, loading, error } = useData();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showLoading, setShowLoading] = useState(true);
  const [appVisible, setAppVisible] = useState(false);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
    // 等退出动画播完再显示主应用
    setTimeout(() => setAppVisible(true), 500);
  }, []);

  // 确保 loading 组件始终能正常走完自己的生命周期
  // 只有 handleLoadingComplete 能关闭它
  const shouldShowLoading = showLoading;

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="text-center p-8 rounded-2xl bg-bg-card border border-border-card">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-accent-red text-lg font-semibold mb-2">数据加载失败</p>
          <p className="text-text-secondary text-sm">{error || '未知错误，请刷新页面重试'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 rounded-lg bg-accent-blue/20 text-accent-blue text-sm font-medium hover:bg-accent-blue/30 transition-colors cursor-pointer"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  if (!data && !loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="text-center">
          <p className="text-text-secondary text-sm">正在初始化...</p>
        </div>
      </div>
    );
  }

  const isGridTab = gridTabs.includes(activeTab);

  const renderGrid = () => {
    switch (activeTab) {
      case 'regional': return <RegionalGrid data={data!} />;
      case 'safety': return <SafetyGrid data={data!} />;
      case 'facility': return <FacilityGrid data={data!} />;
      case 'faculty': return <FacultyGrid data={data!} />;
      default: return null;
    }
  };

  return (
    <>
      {shouldShowLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

      {!showLoading && data && (
      <div
        className={`bg-bg-primary relative h-svh overflow-hidden flex flex-col transition-opacity duration-500 ${
          appVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
          <Particles
            particleColors={['#ffffff']}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover
            alphaParticles={false}
            disableRotation={false}
            pixelRatio={1}
          />
        </div>
        <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden">
          <Header compact={isGridTab} />
          <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} compact={isGridTab} />
          {activeTab === 'overview' ? (
            <div className="flex-1 min-h-0 overflow-hidden">
              {data && <OverviewPager key="overview-pager" data={data} />}
            </div>
          ) : (
            <section key={activeTab} className="grid-tab-page tab-page-enter">{renderGrid()}</section>
          )}
          <footer className="flex-shrink-0 text-center py-2.5 text-text-secondary text-xs border-t border-border-subtle bg-bg-primary/60 backdrop-blur-sm">
            <p>义务教育标准化学校监测数据可视化看板 · 2026年温州市第二届教育数据可视化技能大赛</p>
            <p className="mt-0.5 opacity-60">数据来源：温州市教育局 · 监测学校总数：{data?.overall.total_schools ?? '—'}所</p>
          </footer>
        </div>
      </div>
      )}
    </>
  );
}
