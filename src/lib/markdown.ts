export function extractTags(content: string): string[] {
  const regex = /#+([a-zA-Z0-9_-]+)/g;
  const tags: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    tags.push(match[1].toLowerCase());
  }
  return [...new Set(tags)];
}

export function extractUncheckedTasks(content: string): string[] {
  const tasks: string[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^- \[ \]\s+(.+)/);
    if (match) {
      tasks.push(match[1].trim());
    }
  }
  return tasks;
}

export function extractCheckedTasks(content: string): string[] {
  const tasks: string[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^- \[x\]\s+(.+)/i);
    if (match) {
      tasks.push(match[1].trim());
    }
  }
  return tasks;
}

export function extractAllTasks(content: string): { checked: string[]; unchecked: string[] } {
  const lines = content.split("\n");
  const checked: string[] = [];
  const unchecked: string[] = [];
  for (const line of lines) {
    const uMatch = line.match(/^- \[ \]\s+(.+)/);
    if (uMatch) { unchecked.push(uMatch[1].trim()); continue; }
    const cMatch = line.match(/^- \[x\]\s+(.+)/i);
    if (cMatch) { checked.push(cMatch[1].trim()); }
  }
  return { checked, unchecked };
}
