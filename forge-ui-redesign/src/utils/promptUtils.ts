/**
 * Prompt enhancement utilities for Stable Diffusion
 * Supports attention syntax, wildcards, templates, and quality enhancers
 */

export interface AttentionToken {
  text: string;
  weight: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  description?: string;
}

export interface WildcardOptions {
  seed?: number;
}

/**
 * Parse attention/emphasis syntax: (word:weight)
 * Examples: (beautiful:1.2), (ugly:0.8), ((very detailed))
 */
export function parseAttentionSyntax(prompt: string): AttentionToken[] {
  const tokens: AttentionToken[] = [];
  let currentText = '';
  let i = 0;

  while (i < prompt.length) {
    const char = prompt[i];

    // Check for attention syntax: (text:weight)
    if (char === '(' && prompt[i + 1] !== '(') {
      // Save any accumulated text
      if (currentText.trim()) {
        tokens.push({ text: currentText.trim(), weight: 1.0 });
        currentText = '';
      }

      // Find the closing parenthesis
      let depth = 1;
      let j = i + 1;
      while (j < prompt.length && depth > 0) {
        if (prompt[j] === '(') depth++;
        if (prompt[j] === ')') depth--;
        j++;
      }

      const content = prompt.slice(i + 1, j - 1);
      const colonIndex = content.lastIndexOf(':');

      if (colonIndex > 0) {
        const text = content.slice(0, colonIndex).trim();
        const weightStr = content.slice(colonIndex + 1).trim();
        const weight = parseFloat(weightStr);

        if (!isNaN(weight)) {
          tokens.push({ text, weight });
          i = j;
          continue;
        }
      }

      // If no valid weight found, treat as regular parentheses (emphasis by 1.1)
      tokens.push({ text: content.trim(), weight: 1.1 });
      i = j;
    }
    // Handle double/triple parentheses as shorthand for emphasis
    else if (char === '(' && prompt[i + 1] === '(') {
      // Count consecutive opening parens
      let parenCount = 0;
      while (i < prompt.length && prompt[i] === '(') {
        parenCount++;
        i++;
      }

      // Find matching closing parens
      let depth = parenCount;
      let j = i;
      let innerText = '';
      while (j < prompt.length && depth > 0) {
        if (prompt[j] === ')') {
          depth--;
        } else if (depth === parenCount) {
          innerText += prompt[j];
        }
        j++;
      }

      if (innerText.trim()) {
        // Each () adds 0.1 to weight
        const weight = 1.0 + (parenCount * 0.1);
        tokens.push({ text: innerText.trim(), weight });
      }

      i = j;
    } else {
      currentText += char;
      i++;
    }
  }

  // Add any remaining text
  if (currentText.trim()) {
    tokens.push({ text: currentText.trim(), weight: 1.0 });
  }

  return tokens;
}

/**
 * Validate attention syntax and return errors if any
 */
export function validateAttentionSyntax(prompt: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  let parenDepth = 0;
  let bracketDepth = 0;

  for (let i = 0; i < prompt.length; i++) {
    const char = prompt[i];

    if (char === '(') parenDepth++;
    if (char === ')') parenDepth--;
    if (char === '[') bracketDepth++;
    if (char === ']') bracketDepth--;

    if (parenDepth < 0) {
      errors.push(`Unmatched closing parenthesis at position ${i}`);
      parenDepth = 0;
    }

    if (bracketDepth < 0) {
      errors.push(`Unmatched closing bracket at position ${i}`);
      bracketDepth = 0;
    }
  }

  if (parenDepth > 0) {
    errors.push(`${parenDepth} unclosed parentheses`);
  }

  if (bracketDepth > 0) {
    errors.push(`${bracketDepth} unclosed brackets`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Process wildcard syntax: [option1|option2|option3]
 * Randomly selects one option
 */
export function processWildcards(
  prompt: string,
  options: WildcardOptions = {}
): string {
  // Use provided seed or generate random one
  const seed = options.seed ?? Math.random();
  let processedPrompt = prompt;
  let counter = 0;

  // Find all wildcard patterns
  const wildcardRegex = /\[([^\]]+)\]/g;
  let match;

  while ((match = wildcardRegex.exec(prompt)) !== null) {
    const fullMatch = match[0];
    const content = match[1];
    const options = content.split('|').map((opt) => opt.trim());

    if (options.length > 0) {
      // Use seed to deterministically select option
      const seededRandom = (seed + counter) % 1;
      const index = Math.floor(seededRandom * options.length);
      const selected = options[index] || options[0];

      processedPrompt = processedPrompt.replace(fullMatch, selected);
      counter++;
    }

    wildcardRegex.lastIndex = 0; // Reset regex for next iteration
  }

  return processedPrompt;
}

/**
 * Quality enhancement presets
 */
export const QUALITY_PRESETS = {
  highQuality: {
    name: 'High Quality',
    tags: [
      'masterpiece',
      'best quality',
      'high resolution',
      'highly detailed',
      'sharp focus',
    ],
  },
  ultraQuality: {
    name: 'Ultra Quality',
    tags: [
      'masterpiece',
      'best quality',
      'ultra high resolution',
      '8k',
      'extremely detailed',
      'perfect composition',
      'professional',
    ],
  },
  artistic: {
    name: 'Artistic',
    tags: [
      'artistic',
      'beautiful',
      'aesthetic',
      'trending on artstation',
      'award winning',
    ],
  },
  photorealistic: {
    name: 'Photorealistic',
    tags: [
      'photorealistic',
      'realistic',
      'photo',
      'highly detailed',
      'professional photography',
      'dslr',
    ],
  },
  anime: {
    name: 'Anime Style',
    tags: [
      'anime',
      'manga',
      'high quality anime',
      'detailed anime',
      'official art',
    ],
  },
};

/**
 * Negative prompt presets
 */
export const NEGATIVE_PRESETS = {
  standard: {
    name: 'Standard',
    tags: [
      'low quality',
      'worst quality',
      'blurry',
      'bad anatomy',
      'bad proportions',
    ],
  },
  comprehensive: {
    name: 'Comprehensive',
    tags: [
      'low quality',
      'worst quality',
      'blurry',
      'bad anatomy',
      'bad proportions',
      'deformed',
      'disfigured',
      'ugly',
      'gross proportions',
      'malformed limbs',
      'missing arms',
      'missing legs',
      'extra arms',
      'extra legs',
      'mutated hands',
      'poorly drawn hands',
      'poorly drawn face',
    ],
  },
  photorealistic: {
    name: 'Photo Negatives',
    tags: [
      'illustration',
      'painting',
      'drawing',
      'art',
      'sketch',
      'low quality',
      'blurry',
      'grainy',
      'bad lighting',
    ],
  },
  anime: {
    name: 'Anime Negatives',
    tags: [
      'realistic',
      'photo',
      'photorealistic',
      '3d',
      'low quality',
      'worst quality',
      'bad anatomy',
    ],
  },
};

/**
 * Apply quality preset to prompt
 */
export function applyQualityPreset(
  prompt: string,
  presetKey: keyof typeof QUALITY_PRESETS
): string {
  const preset = QUALITY_PRESETS[presetKey];
  const qualityTags = preset.tags.join(', ');

  // Check if prompt already has quality tags
  const hasQualityTags = preset.tags.some((tag) =>
    prompt.toLowerCase().includes(tag.toLowerCase())
  );

  if (hasQualityTags) {
    return prompt; // Don't duplicate
  }

  return `${prompt}, ${qualityTags}`;
}

/**
 * Apply negative preset to negative prompt
 */
export function applyNegativePreset(
  negativePrompt: string,
  presetKey: keyof typeof NEGATIVE_PRESETS
): string {
  const preset = NEGATIVE_PRESETS[presetKey];
  const negativeTags = preset.tags.join(', ');

  if (!negativePrompt.trim()) {
    return negativeTags;
  }

  // Check if negative prompt already has these tags
  const hasTags = preset.tags.some((tag) =>
    negativePrompt.toLowerCase().includes(tag.toLowerCase())
  );

  if (hasTags) {
    return negativePrompt; // Don't duplicate
  }

  return `${negativePrompt}, ${negativeTags}`;
}

/**
 * Prompt templates
 */
export const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'portrait',
    name: 'Portrait',
    category: 'Photography',
    template: 'portrait photo of {subject}, {style}, {lighting}, professional photography',
    description: 'Professional portrait photography template',
  },
  {
    id: 'landscape',
    name: 'Landscape',
    category: 'Photography',
    template: '{location}, {time_of_day}, {weather}, landscape photography, wide angle',
    description: 'Landscape photography template',
  },
  {
    id: 'character',
    name: 'Character Design',
    category: 'Illustration',
    template: '{character_description}, character design, {art_style}, full body, white background',
    description: 'Character design template',
  },
  {
    id: 'scene',
    name: 'Scene/Environment',
    category: 'Illustration',
    template: '{environment}, {mood}, {lighting}, concept art, detailed background',
    description: 'Environment scene template',
  },
  {
    id: 'product',
    name: 'Product Photography',
    category: 'Photography',
    template: '{product}, product photography, clean background, studio lighting, commercial',
    description: 'Product photography template',
  },
];

/**
 * Fill template with values
 */
export function fillTemplate(template: string, values: Record<string, string>): string {
  let result = template;

  for (const [key, value] of Object.entries(values)) {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value || '');
  }

  // Remove empty placeholders
  result = result.replace(/\{[^}]+\}/g, '');

  // Clean up extra commas and spaces
  result = result.replace(/,\s*,/g, ',');
  result = result.replace(/,\s*$/g, '');
  result = result.trim();

  return result;
}

/**
 * Extract placeholders from template
 */
export function extractPlaceholders(template: string): string[] {
  const matches = template.match(/\{([^}]+)\}/g);
  if (!matches) return [];

  return matches.map((match) => match.slice(1, -1));
}

/**
 * Get saved prompts from localStorage
 */
export function getSavedPrompts(): Array<{
  id: string;
  prompt: string;
  negativePrompt?: string;
  tags: string[];
  timestamp: number;
}> {
  try {
    const saved = localStorage.getItem('forge-saved-prompts');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Save prompt to localStorage
 */
export function savePrompt(
  prompt: string,
  negativePrompt?: string,
  tags: string[] = []
): void {
  try {
    const saved = getSavedPrompts();
    saved.unshift({
      id: Date.now().toString(),
      prompt,
      negativePrompt,
      tags,
      timestamp: Date.now(),
    });

    // Keep only last 100 prompts
    if (saved.length > 100) {
      saved.splice(100);
    }

    localStorage.setItem('forge-saved-prompts', JSON.stringify(saved));
  } catch (error) {
    console.error('Failed to save prompt:', error);
  }
}

/**
 * Delete saved prompt
 */
export function deleteSavedPrompt(id: string): void {
  try {
    const saved = getSavedPrompts();
    const filtered = saved.filter((p) => p.id !== id);
    localStorage.setItem('forge-saved-prompts', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete prompt:', error);
  }
}

/**
 * Search saved prompts
 */
export function searchPrompts(query: string): Array<{
  id: string;
  prompt: string;
  negativePrompt?: string;
  tags: string[];
  timestamp: number;
}> {
  const saved = getSavedPrompts();
  const lowerQuery = query.toLowerCase();

  return saved.filter(
    (p) =>
      p.prompt.toLowerCase().includes(lowerQuery) ||
      p.negativePrompt?.toLowerCase().includes(lowerQuery) ||
      p.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}
