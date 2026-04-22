import React, { useEffect, useState } from 'react';
import { useWorkflowStore } from '../../store/store';
import { NodeDefinition, FieldDefinition, HRNode } from '../../types';
import { fetchAutomations, mockActions } from '../../api/mockApi';

interface DynamicFormProps {
    node: HRNode;
    config: NodeDefinition;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ node, config }) => {
    const updateNodeData = useWorkflowStore(state => state.updateNodeData);
    const [automations, setAutomations] = useState<typeof mockActions>([]);

    // Hydrate automations if we need to
    useEffect(() => {
        const hasActionId = config.fields.some(f => f.name === 'actionId');
        if (hasActionId) {
            fetchAutomations().then(res => setAutomations(res));
        }
    }, [config]);

    const handleChange = (name: string, value: any) => {
        updateNodeData(node.id, { [name]: value });
    };

    const renderField = (field: FieldDefinition) => {
        const value = node.data[field.name];

        switch (field.type) {
            case 'text':
            case 'number':
                return (
                    <input
                        type={field.type}
                        value={value ?? field.defaultValue ?? ''}
                        onChange={(e) => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        value={value ?? field.defaultValue ?? ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[80px] shadow-sm"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                    />
                );
            case 'select':
                let options = field.options || [];
                if (field.name === 'actionId') {
                    options = automations.map(a => ({ label: a.label, value: a.id }));
                }

                return (
                    <select
                        value={value ?? field.defaultValue ?? ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                    >
                        <option value="" disabled>Select an option</option>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            case 'boolean':
                return (
                    <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => handleChange(field.name, e.target.checked)}
                            className="w-4 h-4 text-sky-600 border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded focus:ring-sky-500"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">Enable {field.label}</span>
                    </label>
                );
            case 'key-value':
                return (
                    <div className="text-xs text-slate-400 dark:text-slate-500 italic p-3 border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                        Key-Value editor coming soon in full version.
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {config.fields.map((field) => (
                <div key={field.name} className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 tracking-wide uppercase">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderField(field)}
                </div>
            ))}
        </div>
    );
};
