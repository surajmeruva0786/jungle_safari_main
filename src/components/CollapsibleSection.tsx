import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            >
                <span className="font-semibold text-gray-800 dark:text-gray-200">{title}</span>
                {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
            </button>
            {isOpen && (
                <div className="p-3 bg-white dark:bg-gray-900 space-y-2">
                    {children}
                </div>
            )}
        </div>
    );
}
