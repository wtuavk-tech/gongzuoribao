
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
  LayoutGrid
} from 'lucide-react';

// --- 类型定义 ---

type TabType = '日报预警' | '预警通知' | '任务设定' | '任务' | '工作日报' | '公告配置';

// --- 配置项 (严格按照 1-6 图还原) ---

const TAB_CONFIGS: Record<TabType, { search: string[], headers: string[] }> = {
  '日报预警': {
    search: ['部门', '用户', '配置项', '预警类型'],
    headers: ['部门', '创建时间', '用户', '预警类型', '配置项', '预警天数', '预警值', '创建人', '接收人id', '备注']
  },
  '预警通知': {
    search: ['创建时间'],
    headers: ['姓名', '预警时间', '预警类型', '内容', '创建者', '创建时间']
  },
  '任务设定': {
    search: ['用户名', '任务名称', '状态'],
    headers: ['创建者', '创建时间', '任务名称', '用户名', '任务设定值', '状态', '备注']
  },
  '任务': {
    search: ['任务日期', '用户名', '任务名称', '完成状态'],
    headers: ['用户名', '任务名称', '完成状态', '任务日期', '任务设定', '当前完成数', '凭证']
  },
  '工作日报': {
    search: ['职级', '填写人', '部门', '日报时间'],
    headers: ['批注确认状态', '填写人', '部门', '应到人数', '实到人数', '平均单数', '职级', '填写时间', '日报时间', '电话量/咨询量', '总单数', '老兵单数', '加好友数', '出错数', '目标单数', '转化率', '情况说明', '明日计划', '批注']
  },
  '公告配置': {
    search: ['发布时间', '公告类型', '发布对象', '发布状态', '起止时间', '标题', '生效状态'],
    headers: ['文号', '公告类型', '标题', '公告对象', '发布时间', '起止时间', '是否生效', '附件', '发布状态']
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
  <div className="flex items-center gap-4 mb-2 px-4 py-2 bg-[#fff7e6] border border-[#ffd591] rounded-lg shadow-sm overflow-hidden shrink-0">
    <div className="flex items-center gap-2 text-[#d46b08] shrink-0">
      <Bell size={14} className="animate-pulse" />
      <span className="text-xs font-bold">系统公告</span>
    </div>
    <div className="flex-1 overflow-hidden relative h-5 flex items-center">
      <div className="whitespace-nowrap animate-[marquee_30s_linear_infinite] flex items-center gap-8 text-[11px] text-[#d46b08]">
        <span>📢 欢迎使用业务订单管理系统，系统将于今晚进行常规维护。请各位同事提前保存数据，避免影响报销流程。</span>
      </div>
    </div>
    <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
  </div>
);

const TabSelector = ({ activeTab, onSelect }: { activeTab: TabType, onSelect: (t: TabType) => void }) => {
  const tabs: TabType[] = ['日报预警', '预警通知', '任务设定', '任务', '工作日报', '公告配置'];
  return (
    <div className="grid grid-cols-6 gap-1 mb-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={`h-9 border border-slate-300 rounded-lg text-[12px] transition-all flex items-center justify-center px-2 text-center break-all leading-tight ${
            activeTab === tab ? 'bg-[#1890ff] text-white border-[#1890ff] shadow-sm' : 'bg-white text-slate-600 hover:border-blue-400 hover:text-blue-500'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

const DataOverview = () => (
  <div className="bg-[#f0f7ff] rounded-lg border border-[#d9d9d9] overflow-hidden flex items-center shadow-sm h-12 mb-2">
    <div className="flex items-center gap-3 px-4 flex-1">
      <div className="flex items-center gap-2 mr-8 shrink-0">
        <Activity size={18} className="text-[#1890ff]" />
        <span className="text-sm font-bold text-[#003a8c]">数据概览</span>
      </div>
      <div className="flex gap-12">
        {[['待审核数', '12', '#262626'], ['今日已审核', '45', '#262626'], ['当月已审核', '892', '#52c41a'], ['当年已审核', '12540', '#f5222d']].map(([label, val, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[12px] text-[#8c8c8c]">{label}:</span>
            <span className="text-base font-bold font-mono" style={{ color }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="h-full px-5 bg-[#e6f7ff] border-l border-[#d9d9d9] flex items-center gap-2 text-[#1890ff] font-medium text-xs cursor-pointer hover:bg-blue-100 transition-colors">
      <Search size={14} />
      <span>点这高级筛选</span>
    </div>
  </div>
);

const SearchPanel = ({ tab }: { tab: TabType }) => {
  const config = TAB_CONFIGS[tab];
  if (config.search.length === 0) return null;

  const renderField = (field: string) => (
    <div key={field} className="flex items-center gap-2 min-w-[200px]">
      <span className="text-[11px] text-slate-500 shrink-0 whitespace-nowrap">{field}</span>
      {field.includes('时间') || field.includes('日期') || field === '起止时间' ? (
        <div className="flex items-center gap-1 flex-1">
          <input type="date" className="flex-1 border border-slate-200 rounded h-7 px-1 text-[10px] outline-none" />
          <span className="text-slate-300">至</span>
          <input type="date" className="flex-1 border border-slate-200 rounded h-7 px-1 text-[10px] outline-none" />
        </div>
      ) : (
        <input type="text" placeholder="请输入内容" className="flex-1 border border-slate-200 rounded h-7 px-2 text-[11px] outline-none focus:border-blue-400" />
      )}
    </div>
  );

  return (
    <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm mb-2 overflow-x-auto">
      <div className="flex flex-nowrap gap-x-6 items-center min-w-max">
        {/* 所有筛选项 */}
        <div className="flex flex-nowrap gap-x-6 items-center">
          {config.search.map(renderField)}
        </div>
        
        {/* 搜索和重置按钮 */}
        <div className="flex gap-2 shrink-0 border-l border-slate-100 pl-6">
          <button className="h-7 px-4 bg-[#1890ff] text-white rounded text-[11px] hover:bg-blue-600 transition-colors">搜索</button>
          <button className="h-7 px-4 bg-white border border-slate-200 text-slate-600 rounded text-[11px] hover:bg-slate-50 transition-colors">重置</button>
        </div>

        {/* 新增、导出等功能按钮 */}
        <div className="flex gap-2 shrink-0 border-l border-slate-100 pl-6">
          <button className="h-7 px-3 bg-[#1890ff] text-white rounded text-[11px] flex items-center gap-1 hover:bg-blue-600 transition-colors">
            <Plus size={14}/> {tab === '公告配置' ? '新建公告' : '新增'}
          </button>
          <button className="h-7 px-3 bg-[#52c41a] text-white rounded text-[11px] flex items-center gap-1 hover:bg-green-600 transition-colors">
            <FileSpreadsheet size={14}/> 导出
          </button>
          
          {tab === '工作日报' && (
            <>
              <button className="h-7 px-3 bg-[#faad14] text-white rounded text-[11px] flex items-center gap-1 hover:bg-yellow-600 transition-colors">
                <History size={14}/> 未写日报
              </button>
              <button className="h-7 px-3 bg-[#13c2c2] text-white rounded text-[11px] flex items-center gap-1 hover:bg-teal-600 transition-colors">
                <LayoutGrid size={14}/> 日报汇总
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState<TabType>('日报预警');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const config = TAB_CONFIGS[activeTab];
  const data = useMemo(() => generateRows(activeTab), [activeTab]);

  return (
    <div className="h-screen bg-[#f8fafc] p-3 flex flex-col overflow-hidden font-sans text-slate-800">
      <NotificationBar />
      <TabSelector activeTab={activeTab} onSelect={(t) => { setActiveTab(t); setCurrentPage(1); }} />
      <DataOverview />
      <SearchPanel tab={activeTab} />
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[2000px]">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
              <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-3 py-3 text-center w-14 border-r border-slate-100">序号</th>
                {config.headers.map(h => (
                  <th key={h} className="px-3 py-3 min-w-[120px] border-r border-slate-100">{h}</th>
                ))}
                <th className="px-3 py-3 w-32 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_4px_rgba(0,0,0,0.02)]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, idx) => (
                <tr 
                  key={idx} 
                  className={`hover:bg-blue-50/40 transition-colors text-[11px] text-slate-600 h-11 ${idx % 2 === 1 ? 'bg-blue-50/50' : 'bg-white'}`}
                >
                  <td className="px-3 py-1 text-center border-r border-slate-100">{(currentPage - 1) * pageSize + idx + 1}</td>
                  {config.headers.map(h => (
                    <td key={h} className={`px-3 py-1 border-r border-slate-100 truncate max-w-[250px] ${h.includes('数') || h.includes('值') || h === '转化率' ? 'text-center' : ''}`}>
                      {h === '状态' || h === '是否生效' || h === '发布状态' || h === '完成状态' || h === '批注确认状态' ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] ${row[h] === '生效' || row[h] === '已完成' || row[h] === '已发布' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                          {row[h]}
                        </span>
                      ) : row[h]}
                    </td>
                  ))}
                  <td className={`px-3 py-1 text-center sticky right-0 group-hover:bg-blue-50/40 shadow-[-4px_0_4px_rgba(0,0,0,0.02)] ${idx % 2 === 1 ? 'bg-[#f8fcff]' : 'bg-white'}`}>
                    <div className="flex justify-center gap-3">
                      <button className="text-[#1890ff] hover:text-blue-700 flex items-center gap-0.5 transition-colors font-medium">
                        <Edit size={12}/> {activeTab === '公告配置' ? '查看' : '修改'}
                      </button>
                      <button className="text-[#ff4d4f] hover:text-red-700 flex items-center gap-0.5 transition-colors font-medium">
                        <Trash2 size={12}/> {activeTab === '公告配置' ? '撤销' : '删除'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页组件 */}
        <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-center gap-4 text-[11px] bg-slate-50">
          <span className="text-slate-500">共 {data.length} 条</span>
          <div className="flex gap-1">
            <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50"><ChevronLeft size={12}/></button>
            <button className="w-6 h-6 border rounded font-medium bg-[#1890ff] text-white border-[#1890ff]">1</button>
            <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50"><ChevronRight size={12}/></button>
          </div>
          <div className="flex items-center gap-1">
            <span>前往</span>
            <input type="number" defaultValue={1} className="w-8 h-6 border border-slate-200 rounded text-center outline-none" />
            <span>页</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) { const root = createRoot(container); root.render(<App />); }
