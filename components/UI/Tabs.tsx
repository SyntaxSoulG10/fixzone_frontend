import { ReactNode } from 'react';

interface Tab {
    id: string;
    label: string;
    icon?: ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
    return (
        <div className={`flex items-center gap-2 p-1 bg-slate-100/50 rounded-xl w-fit ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`
                        relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2
                        ${activeTab === tab.id
                            ? 'bg-white text-primary shadow-sm shadow-slate-200 ring-1 ring-slate-200'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }
                    `}
                >
                    {tab.icon && <span className="text-lg">{tab.icon}</span>}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
