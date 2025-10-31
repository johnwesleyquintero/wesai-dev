
import React from 'react';

export interface PromptTemplate {
  title: string;
  description: string;
  prompt: string;
  key: 'landing-page' | 'writing-app' | 'todo-list';
}

export const quickStartPrompts: PromptTemplate[] = [
  {
    title: "Modern Landing Page",
    description: "A hero section, feature list, and a footer.",
    prompt: "A modern landing page for a SaaS product with a hero section, feature list, and a footer.",
    key: 'landing-page'
  },
  {
    title: "Creative Writing App",
    description: "Generates writing prompts based on a genre.",
    prompt: "A mini-app that generates creative writing prompts based on a selected genre.",
    key: 'writing-app'
  },
  {
    title: "Simple To-Do List",
    description: "Add, complete, and manage daily tasks.",
    prompt: "A simple to-do list app with the ability to add and complete tasks.",
    key: 'todo-list'
  },
];
