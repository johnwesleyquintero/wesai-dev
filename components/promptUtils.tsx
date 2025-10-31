import React from 'react';
import { LandingPageIcon, WritingAppIcon, TodoListIcon } from './Icons';
import { PromptTemplate } from '../copilot/prompts';

export const getPromptIcon = (key: PromptTemplate['key'], baseClassName: string): React.ReactNode => {
    switch (key) {
        case 'landing-page':
            return <LandingPageIcon className={`${baseClassName} text-indigo-500 dark:text-indigo-400`} />;
        case 'writing-app':
            return <WritingAppIcon className={`${baseClassName} text-purple-500 dark:text-purple-400`} />;
        case 'todo-list':
            return <TodoListIcon className={`${baseClassName} text-sky-500 dark:text-sky-400`} />;
        default:
            return null;
    }
};
