/**
 * Converts legacy file paths to environment-aware resource URLs.
 *
 * Maps old local paths to the external GitHub Pages repository structure.
 * Works in both development and production by always applying path mappings.
 *
 * @param {string} oldPath - Legacy path (e.g., './a-pbqs/network-connectivity-pbq-1.html' or '/a-exams/practice-exam-1.html')
 * @returns {string} Full URL to external resource
 *
 * @example
 * // With VITE_RESOURCES_BASE_URL=https://lui-gi.github.io/shelnet-resources
 * convertLegacyPath('./a-pbqs/network-connectivity-pbq-1.html')
 * // Returns: 'https://lui-gi.github.io/shelnet-resources/practice-pbqs/a-plus/network-connectivity-pbq-1.html'
 *
 * @example
 * convertLegacyPath('/a-exams/practice-exam-1.html')
 * // Returns: 'https://lui-gi.github.io/shelnet-resources/practice-exams/a-plus/practice-exam-1.html'
 */
export function convertLegacyPath(oldPath) {
  const baseUrl = import.meta.env.VITE_RESOURCES_BASE_URL || 'https://lui-gi.github.io/shelnet-resources';

  // Map old paths to new external repository structure
  const pathMappings = {
    './a-pbqs/': 'practice-pbqs/a-plus/',
    '/a-pbqs/': 'practice-pbqs/a-plus/',
    './security-pbqs/': 'practice-pbqs/security-plus/',
    '/security-pbqs/': 'practice-pbqs/security-plus/',
    './a-exams/': 'practice-exams/a-plus/',
    '/a-exams/': 'practice-exams/a-plus/',
    './security-exams/': 'practice-exams/security-plus/',
    '/security-exams/': 'practice-exams/security-plus/'
  };

  // Find matching path prefix and convert to new structure
  for (const [oldPrefix, newPrefix] of Object.entries(pathMappings)) {
    if (oldPath.startsWith(oldPrefix)) {
      const filename = oldPath.replace(oldPrefix, '');
      return `${baseUrl}/${newPrefix}${filename}`;
    }
  }

  // Fallback: return original path
  console.warn(`No path mapping found for: ${oldPath}`);
  return oldPath;
}
