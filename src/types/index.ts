/**
 * Type definitions for Cadence - Real-time Lyric Syllable Analyzer
 */

// ============================================================================
// Worker Message Types
// ============================================================================

/**
 * Request sent to the syllable processing worker
 */
export interface WorkerRequest {
  /** Unique identifier for this request */
  id: number;
  /** Type of operation to perform */
  type: 'process-line';
  /** The text content to process */
  text: string;
  /** Line number in the document (0-based) */
  lineNumber: number;
}

/**
 * Response received from the syllable processing worker
 */
export interface WorkerResponse {
  /** Request ID this response corresponds to */
  id: number;
  /** Type of response */
  type: 'line-result' | 'error';
  /** Line number processed (0-based) */
  lineNumber: number;
  /** Syllable data for the line */
  data?: SyllableData;
  /** Error message if processing failed */
  error?: string;
}

// ============================================================================
// Syllable Processing Types
// ============================================================================

/**
 * Syllable information for a single word
 */
export interface WordSyllables {
  /** The original word text */
  word: string;
  /** Hyphenated display version with middle dots (e.g., "beau·ti·ful") */
  hyphenated: string;
  /** Number of syllables detected */
  count: number;
  /** Positions of syllable boundaries (character indices) */
  positions: number[];
  /** Whether syllable detection succeeded */
  success: boolean;
  /** Error message if detection failed */
  error?: string;
}

/**
 * Complete syllable data for a line of text
 */
export interface SyllableData {
  /** Total syllable count for the line */
  totalSyllables: number;
  /** Syllable data for each word */
  words: WordSyllables[];
  /** Whether the entire line was successfully processed */
  success: boolean;
  /** Any warnings or errors encountered */
  errors?: string[];
}

// ============================================================================
// CodeMirror Extension Types
// ============================================================================

/**
 * State field value storing syllable data for all lines
 */
export interface SyllableState {
  /** Map of line number to syllable data */
  lines: Map<number, SyllableData>;
  /** Timestamp of last update */
  lastUpdate: number;
}

/**
 * Transaction effect for updating syllable data
 */
export interface SyllableUpdateEffect {
  /** Line number to update */
  lineNumber: number;
  /** New syllable data for the line */
  data: SyllableData;
}

// ============================================================================
// UI Component Types
// ============================================================================

/**
 * Props for the main LyricEditor component
 */
export interface LyricEditorProps {
  /** Current content value (controlled component) */
  value: string;
  /** Callback when content changes */
  onChange?: (value: string) => void;
  /** Callback when syllable data updates */
  onSyllableUpdate?: (lineNumber: number, data: SyllableData) => void;
  /** Whether to show syllable markers */
  syllablesVisible?: boolean;
  /** Font size for editor text */
  fontSize?: number;
  /** CSS class name for the editor container */
  className?: string;
}

/**
 * Props for the ErrorDisplay component
 */
export interface ErrorDisplayProps {
  /** Array of error messages to display */
  errors: string[];
  /** Callback when errors are dismissed */
  onDismiss?: () => void;
  /** CSS class name for the error container */
  className?: string;
}

// ============================================================================
// Editor Configuration Types
// ============================================================================

/**
 * Configuration for the syllable gutter
 */
export interface GutterConfig {
  /** Width of the gutter in pixels */
  width?: number;
  /** Whether to show zero counts */
  showZero?: boolean;
  /** Custom CSS class for gutter elements */
  className?: string;
}

/**
 * Configuration for syllable decorations
 */
export interface DecorationConfig {
  /** Character to use for syllable markers */
  marker?: string;
  /** CSS class for marker elements */
  markerClass?: string;
  /** Whether to show markers on hover only */
  hoverOnly?: boolean;
}

/**
 * Configuration for smart formatting
 */
export interface FormattingConfig {
  /** Enable section header detection ([Verse], [Chorus], etc.) */
  enableHeaders?: boolean;
  /** Enable chord detection (text in square brackets on separate lines) */
  enableChords?: boolean;
  /** Enable comment detection (lines starting with #) */
  enableComments?: boolean;
  /** Custom regex patterns for detection */
  customPatterns?: RegExp[];
}

/**
 * Complete editor configuration
 */
export interface EditorConfig {
  gutter?: GutterConfig;
  decorations?: DecorationConfig;
  formatting?: FormattingConfig;
}
