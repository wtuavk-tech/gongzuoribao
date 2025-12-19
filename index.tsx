
import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  Bell,
  Plus,
  FileSpreadsheet,
  Activity,
  Trash2,
  Edit,
  History,
  LayoutGrid,
  Filter
} from 'lucide-react';

// --- 类型定义 ---

type TabType = '日报预警' | '预警通知' | '任务设定' | '任务' | '工作日报' | '公告配置';

// --- 配置项 ---

const TAB_CONFIGS: Record<TabType, { search: string[], headers: string[], color: string, bgColor: string, borderColor: string }> = {
  '日报预警': {
    search: ['部门', '用户', '配置项', '预警类型'],
    headers: ['部门', '创建时间', '用户', '预警类型', '配置项', '预警天数', '预警值', '创建人', '接收人id', '备注'],
    color: '#ff4d4f',
    bgColor: '#fff1f0',
    borderColor: '#ffa39e'
  },
  '预警通知': {
    search: ['创建时间'],
    headers: ['姓名', '预警时间', '预警类型', '内容', '创建者', '创建时间'],
    color: '#faad14',
    bgColor: '#fffbe6',
    borderColor: '#ffe58f'
  },
  '任务设定': {
    search: ['用户名', '任务名称', '状态'],
    headers: ['创建者', '创建时间', '任务名称', '用户名', '任务设定值', '状态', '备注'],
    color: '#1890ff',
    bgColor: '#e6f7ff',
    borderColor: '#91d5ff'
  },
  '任务': {
    search: ['任务日期', '用户名', '任务名称', '完成状态'],
    headers: ['用户名', '任务名称', '完成状态', '任务日期', '任务设定', '当前完成数', '凭证'],
    color: '#52c41a',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f'
  },
  '工作日报': {
    search: ['职级', '填写人', '部门', '日报时间'],
    headers: ['批注确认状态', '填写人', '部门', '应到人数', '实到人数', '平均单数', '职级', '填写时间', '日报时间', '电话量/咨询量', '总单数', '老兵单数', '加好友数', '出错数', '目标单数', '转化率', '情况说明', '明日计划', '批注'],
    color: '#13c2c2',
    bgColor: '#e6fffb',
    borderColor: '#87e8de'
  },
  '公告配置': {
    search: ['发布时间', '公告类型', '发布对象', '发布状态', '起止时间', '标题', '生效状态'],
    headers: ['文号', '公告类型', '标题', '公告对象', '发布时间', '起止时间', '是否生效', '附件', '发布状态'],
    color: '#722ed1',
    bgColor: '#f9f0ff',
    borderColor: '#d3adf7'
  }
};

// --- Mock Data 生成 ---

const generateRows = (tab: TabType): any[] => {
  const config = TAB_CONFIGS[tab];
  return Array.from({ length: 20 }).map((_, i) => {
    const row: any = { id: i + 1 };
    config.headers.forEach(h => {
      if (h.includes('时间') || h.includes('日期')) {
        row[h] = `2025-11-${String(20 - (i % 10)).padStart(2, '0')} 14:${String(10 + i).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`;
      } else if (h.includes('状态') || h.includes('级别')) {
        row[h] = i % 2 === 0 ? '生效' : '失效';
      } else if (h.includes('人') || h.includes('姓名') || h.includes('创建者')) {
        row[h] = i % 3 === 0 ? '管理员' : (i % 3 === 1 ? '陈序麟' : '李可');
      } else if (h === '部门') {
        row[h] = i % 2 === 0 ? '派单' : '客服';
      } else if (h.includes('值') || h.includes('数') || h.includes('量')) {
        row[h] = (Math.random() * 100).toFixed(i % 5 === 0 ? 0 : 2);
      } else if (h === '预警类型') {
        row[h] = i % 2 === 0 ? '数据预警' : '日报预警';
      } else if (h === '配置项') {
        row[h] = i % 2 === 0 ? '总单数' : '派单率';
      } else if (h === '标题') {
        row[h] = `系统升级通知 v${i + 1}.0`;
      } else if (h === '文号') {
        row[h] = `JXDJ-GG-2025101${i}`;
      } else {
        row[h] = '--';
      }
    });
    return row;
  });
};

// --- 子组件 ---

const NotificationBar = () => (
  <div className="flex items-center gap-4 mb-3 px-4 py-2 bg-[#0a192f] border border-[#1a2e4d] rounded-xl shadow-lg overflow-hidden shrink-0">
    <div className="flex items-center gap-2 text-white shrink-0">
      <span className="bg-[#ff4d4f] text-[10px] px-2 py-0.5 rounded font-bold">重要公告</span>
      <Bell size={14} className="animate-pulse text-[#ff4d4f]" />
    </div>
    <div className="flex-1 overflow-hidden relative h-5 flex items-center">
      <div className="whitespace-nowrap animate-[marquee_35s_linear_infinite] flex items-center gap-8 text-[12px] text-slate-300 font-medium">
        <span>📢 关于 2025 年度秋季职级晋升评审的通知：点击下方详情以阅读完整公告内容。请所有相关人员务必在截止日期前完成确认。</span>
      </div>
    </div>
    <div className="shrink-0 text-[11px] text-slate-400 bg-white/10 px-2 py-0.5 rounded">2025-11-19</div>
    <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
  </div>
);

const TabSelector = ({ activeTab, onSelect }: { activeTab: TabType, onSelect: (t: TabType) => void }) => {
  const tabs: TabType[] = ['日报预警', '预警通知', '任务设定', '任务', '工作日报', '公告配置'];
  return (
    <div className="grid grid-cols-6 gap-3 mb-3">
      {tabs.map((tab) => {
        const config = TAB_CONFIGS[tab];
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            style={{ 
              backgroundColor: isActive ? config.color : config.bgColor,
              borderColor: config.borderColor,
              color: isActive ? '#fff' : config.color
            }}
            className={`h-11 border rounded-xl text-[13px] font-bold transition-all duration-200 flex items-center justify-center px-4 shadow-sm hover:scale-[1.02] active:scale-[0.98] ${
              isActive ? 'shadow-md ring-2 ring-offset-1 ring-slate-100' : ''
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

const DataOverview = ({ onToggleFilter, isFilterOpen }: { onToggleFilter: () => void, isFilterOpen: boolean }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center shadow-sm h-14 mb-3">
    <div className="flex items-center gap-3 px-6 flex-1">
      <div className="flex items-center gap-3 mr-10 shrink-0">
        <Activity size={20} className="text-[#1890ff]" />
        <span className="text-[15px] font-bold text-slate-700 tracking-tight">数据概览</span>
      </div>
      <div className="flex gap-14">
        {[['待审核数', '12', '#ff4d4f'], ['今日已审核', '45', '#1890ff'], ['当月已审核', '892', '#52c41a'], ['当年已审核', '12540', '#722ed1']].map(([label, val, color]) => (
          <div key={label} className="flex flex-col justify-center">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{label}</span>
            <span className="text-xl font-bold font-mono leading-tight" style={{ color }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
    <div 
      onClick={onToggleFilter}
      className={`h-full px-8 flex items-center gap-2 font-bold text-[13px] cursor-pointer transition-all duration-300 border-l border-slate-100 ${
        isFilterOpen ? 'bg-[#1890ff] text-white' : 'bg-[#f0f5ff] text-[#1890ff] hover:bg-[#e6f7ff]'
      }`}
    >
      {isFilterOpen ? <Filter size={16} /> : <Search size={16} />}
      <span>{isFilterOpen ? '收起高级筛选' : '点这高级筛选'}</span>
    </div>
  </div>
);

const SearchPanel = ({ tab, isOpen }: { tab: TabType, isOpen: boolean }) => {
  if (!isOpen) return null;
  const config = TAB_CONFIGS[tab];
  if (config.search.length === 0) return null;

  const renderField = (field: string) => (
    <div key={field} className="flex items-center gap-3 min-w-[220px]">
      <span className="text-[12px] text-slate-600 font-bold shrink-0 whitespace-nowrap">{field}</span>
      {field.includes('时间') || field.includes('日期') || field === '起止时间' ? (
        <div className="flex items-center gap-1 flex-1">
          <input type="date" className="flex-1 border border-slate-200 rounded-lg h-8 px-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
          <span className="text-slate-300 text-[10px] font-bold">至</span>
          <input type="date" className="flex-1 border border-slate-200 rounded-lg h-8 px-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
        </div>
      ) : (
        <input type="text" placeholder="输入关键字..." className="flex-1 border border-slate-200 rounded-lg h-8 px-3 text-[12px] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
      )}
    </div>
  );

  return (
    <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-md mb-3 animate-[slideDown_0.3s_ease-out] overflow-x-auto">
      <div className="flex flex-nowrap gap-x-8 items-center min-w-max">
        <div className="flex flex-nowrap gap-x-8 items-center">
          {config.search.map(renderField)}
        </div>
        
        <div className="flex gap-2 shrink-0 border-l border-slate-100 pl-8">
          <button className="h-8 px-6 bg-[#1890ff] text-white rounded-lg text-[12px] font-bold hover:bg-blue-600 shadow-sm active:shadow-none transition-all">搜索</button>
          <button className="h-8 px-6 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[12px] font-bold hover:bg-white transition-all">重置</button>
        </div>

        <div className="flex gap-2 shrink-0 border-l border-slate-100 pl-8">
          <button className="h-8 px-4 bg-[#1890ff] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 hover:bg-blue-600 shadow-sm transition-all">
            <Plus size={16}/> {tab === '公告配置' ? '新建公告' : '新增'}
          </button>
          <button className="h-8 px-4 bg-[#52c41a] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 hover:bg-green-600 shadow-sm transition-all">
            <FileSpreadsheet size={16}/> 导出
          </button>
          
          {tab === '工作日报' && (
            <>
              <button className="h-8 px-4 bg-[#faad14] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 hover:bg-yellow-600 shadow-sm transition-all">
                <History size={16}/> 未写日报
              </button>
              <button className="h-8 px-4 bg-[#13c2c2] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 hover:bg-teal-600 shadow-sm transition-all">
                <LayoutGrid size={16}/> 日报汇总
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState<TabType>('日报预警');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const config = TAB_CONFIGS[activeTab];
  const data = useMemo(() => generateRows(activeTab), [activeTab]);

  return (
    <div className="h-screen bg-[#f1f4f9] p-4 flex flex-col overflow-hidden font-sans text-slate-800">
      <NotificationBar />
      <TabSelector activeTab={activeTab} onSelect={(t) => { setActiveTab(t); setCurrentPage(1); }} />
      <DataOverview isFilterOpen={isFilterOpen} onToggleFilter={() => setIsFilterOpen(!isFilterOpen)} />
      <SearchPanel tab={activeTab} isOpen={isFilterOpen} />
      
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[2000px]">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
              <tr className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-5 py-4 text-center w-16 border-r border-slate-100">序号</th>
                {config.headers.map(h => (
                  <th key={h} className="px-5 py-4 min-w-[140px] border-r border-slate-100">{h}</th>
                ))}
                <th className="px-5 py-4 w-36 text-center sticky right-0 bg-slate-50 shadow-[-10px_0_15px_rgba(0,0,0,0.03)] border-l border-slate-100">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, idx) => (
                <tr 
                  key={idx} 
                  className={`hover:bg-blue-50/50 transition-colors text-[13px] text-slate-600 h-12 ${idx % 2 === 1 ? 'bg-[#f8fbff]' : 'bg-white'}`}
                >
                  <td className="px-5 py-2 text-center border-r border-slate-100 font-medium text-slate-400">{(currentPage - 1) * pageSize + idx + 1}</td>
                  {config.headers.map(h => (
                    <td key={h} className={`px-5 py-2 border-r border-slate-100 truncate max-w-[300px] ${h.includes('数') || h.includes('值') || h === '转化率' ? 'text-center font-mono' : ''}`}>
                      {h === '状态' || h === '是否生效' || h === '发布状态' || h === '完成状态' || h === '批注确认状态' ? (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight shadow-sm ${
                          row[h] === '生效' || row[h] === '已完成' || row[h] === '已发布' 
                          ? 'bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]' 
                          : 'bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]'
                        }`}>
                          {row[h]}
                        </span>
                      ) : row[h]}
                    </td>
                  ))}
                  <td className={`px-5 py-2 text-center sticky right-0 shadow-[-10px_0_15px_rgba(0,0,0,0.03)] border-l border-slate-100 ${idx % 2 === 1 ? 'bg-[#f8fbff]' : 'bg-white'}`}>
                    <div className="flex justify-center gap-4">
                      <button className="text-[#1890ff] hover:text-blue-700 flex items-center gap-1 font-bold transition-transform hover:scale-105">
                        <Edit size={14}/> {activeTab === '公告配置' ? '查看' : '修改'}
                      </button>
                      <button className="text-[#ff4d4f] hover:text-red-700 flex items-center gap-1 font-bold transition-transform hover:scale-105">
                        <Trash2 size={14}/> {activeTab === '公告配置' ? '撤销' : '删除'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页组件 */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[13px] bg-white">
          <div className="text-slate-500 font-medium">显示第 {(currentPage-1)*pageSize + 1} 到 {currentPage*pageSize} 条，共 <span className="text-[#1890ff] font-bold">{data.length}</span> 条</div>
          <div className="flex items-center gap-5">
            <div className="flex gap-2">
              <button className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center bg-white hover:bg-slate-50 hover:border-blue-300 transition-all"><ChevronLeft size={16} className="text-slate-400"/></button>
              <button className="w-8 h-8 rounded-lg font-bold bg-[#1890ff] text-white shadow-md">1</button>
              <button className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center bg-white hover:bg-slate-50 hover:border-blue-300 transition-all"><ChevronRight size={16} className="text-slate-400"/></button>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span>前往第</span>
              <input type="number" defaultValue={1} className="w-10 h-8 border border-slate-200 rounded-lg text-center font-bold outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              <span>页</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) { const root = createRoot(container); root.render(<App />); }
