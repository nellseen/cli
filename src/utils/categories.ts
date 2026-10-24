import { CategoryInfo } from '../types';

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  {
    id: 'Linux',
    name: 'Linux',
    description: 'Core Linux utilities, file operations, permissions, and kernel commands',
    color: 'slate',
    icon: 'Terminal',
  },
  {
    id: 'Bash',
    name: 'Bash',
    description: 'Shell scripting patterns, pipelines, redirection, and variable expansion',
    color: 'emerald',
    icon: 'Code2',
  },
  {
    id: 'Git',
    name: 'Git',
    description: 'Version control workflows, branching, rebasing, bisect, and cherry-picking',
    color: 'orange',
    icon: 'GitBranch',
  },
  {
    id: 'Docker',
    name: 'Docker',
    description: 'Container lifecycles, Dockerfiles, Compose orchestration, and volume pruning',
    color: 'blue',
    icon: 'Box',
  },
  {
    id: 'NPM',
    name: 'NPM',
    description: 'Node Package Manager scripts, package auditing, workspaces, and publishing',
    color: 'red',
    icon: 'Package',
  },
  {
    id: 'Python',
    name: 'Python',
    description: 'Virtual environments (venv, uv, poetry), pip management, and CLI execution',
    color: 'indigo',
    icon: 'FileCode2',
  },
  {
    id: 'Networking',
    name: 'Networking',
    description: 'CURL, netstat, ss, traceroute, dig, iptables, and port inspection',
    color: 'cyan',
    icon: 'Globe',
  },
  {
    id: 'System Administration',
    name: 'System Administration',
    description: 'systemd service units, cron scheduling, disk usage (du, df), and user auditing',
    color: 'violet',
    icon: 'Server',
  },
];
