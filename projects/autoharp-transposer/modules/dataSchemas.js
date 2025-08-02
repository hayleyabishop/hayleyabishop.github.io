// =============================================================================
// DATA SCHEMAS
// Defines data structures and validation for the autoharp transposer
// =============================================================================

class DataSchemas {
  constructor() {
    this.version = '1.0';
  }

  // =============================================================================
  // AUTOHARP TYPE SCHEMA
  // =============================================================================
  
  static getAutoharpTypeSchema() {
    return {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true },
      chordCount: { type: 'number', required: true, min: 12, max: 36 },
      availableChords: { type: 'array', required: true, minLength: 12 },
      layout: { type: 'string', required: false, enum: ['standard', 'chromatic', 'custom'] },
      description: { type: 'string', required: false }
    };
  }

  static validateAutoharpType(data) {
    const schema = this.getAutoharpTypeSchema();
    return this.validateObject(data, schema);
  }

  // =============================================================================
  // CHORD SCHEMA
  // =============================================================================
  
  static getChordSchema() {
    return {
      name: { type: 'string', required: true, pattern: /^[A-G][#b]?[^/]*(\/.+)?$/ },
      root: { type: 'string', required: true, pattern: /^[A-G][#b]?$/ },
      quality: { type: 'string', required: false },
      bass: { type: 'string', required: false, pattern: /^[A-G][#b]?$/ },
      normalized: { type: 'string', required: false },
      isValid: { type: 'boolean', required: false, default: true }
    };
  }

  static validateChord(data) {
    const schema = this.getChordSchema();
    return this.validateObject(data, schema);
  }

  // =============================================================================
  // PROGRESSION SCHEMA
  // =============================================================================
  
  static getProgressionSchema() {
    return {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true },
      chords: { type: 'array', required: true, minLength: 1, itemSchema: this.getChordSchema() },
      originalKey: { type: 'string', required: false, pattern: /^[A-G][#b]?$/ },
      targetKey: { type: 'string', required: false, pattern: /^[A-G][#b]?$/ },
      autoharpType: { type: 'string', required: true },
      tempo: { type: 'number', required: false, min: 60, max: 200 },
      timeSignature: { type: 'string', required: false, pattern: /^\d+\/\d+$/ },
      tags: { type: 'array', required: false, itemType: 'string' },
      createdAt: { type: 'date', required: false },
      modifiedAt: { type: 'date', required: false }
    };
  }

  static validateProgression(data) {
    const schema = this.getProgressionSchema();
    return this.validateObject(data, schema);
  }

  // =============================================================================
  // PROJECT SCHEMA
  // =============================================================================
  
  static getProjectSchema() {
    return {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true },
      description: { type: 'string', required: false },
      autoharpType: { type: 'string', required: true },
      progressions: { type: 'array', required: false, itemSchema: this.getProgressionSchema() },
      settings: {
        type: 'object',
        required: false,
        schema: {
          audioEnabled: { type: 'boolean', default: false },
          inputMode: { type: 'string', enum: ['buttons', 'text', 'hybrid'], default: 'hybrid' },
          showProgressions: { type: 'boolean', default: true },
          compactMode: { type: 'boolean', default: false }
        }
      },
      metadata: {
        type: 'object',
        required: false,
        schema: {
          version: { type: 'string', required: false },
          createdAt: { type: 'date', required: false },
          modifiedAt: { type: 'date', required: false },
          author: { type: 'string', required: false }
        }
      }
    };
  }

  static validateProject(data) {
    const schema = this.getProjectSchema();
    return this.validateObject(data, schema);
  }

  // =============================================================================
  // APPLICATION STATE SCHEMA
  // =============================================================================
  
  static getApplicationStateSchema() {
    return {
      autoharpType: { type: 'string', required: true },
      availableChords: { type: 'array', required: true, itemType: 'string' },
      selectedChords: { type: 'array', required: false, itemSchema: this.getChordSchema() },
      audioEnabled: { type: 'boolean', required: false, default: false },
      inputMode: { type: 'string', required: false, enum: ['buttons', 'text', 'hybrid'], default: 'hybrid' },
      suggestions: { type: 'array', required: false, itemType: 'string' },
      currentChordName: { type: 'string', required: false },
      currentChordType: { type: 'string', required: false },
      progressions: { type: 'array', required: false, itemSchema: this.getProgressionSchema() },
      ui: {
        type: 'object',
        required: false,
        schema: {
          showProgressions: { type: 'boolean', default: true },
          compactMode: { type: 'boolean', default: false }
        }
      }
    };
  }

  static validateApplicationState(data) {
    const schema = this.getApplicationStateSchema();
    return this.validateObject(data, schema);
  }

  // =============================================================================
  // VALIDATION ENGINE
  // =============================================================================
  
  static validateObject(data, schema) {
    const errors = [];
    const warnings = [];

    if (!data || typeof data !== 'object') {
      errors.push('Data must be an object');
      return { isValid: false, errors, warnings };
    }

    // Validate each field in the schema
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const value = data[fieldName];
      const fieldErrors = this.validateField(fieldName, value, fieldSchema);
      errors.push(...fieldErrors);
    }

    // Check for unexpected fields
    for (const fieldName of Object.keys(data)) {
      if (!schema[fieldName]) {
        warnings.push(`Unexpected field: ${fieldName}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateField(fieldName, value, fieldSchema) {
    const errors = [];

    // Check required fields
    if (fieldSchema.required && (value === undefined || value === null)) {
      errors.push(`Field '${fieldName}' is required`);
      return errors;
    }

    // Skip validation for optional undefined fields
    if (value === undefined || value === null) {
      return errors;
    }

    // Type validation
    if (fieldSchema.type) {
      if (!this.validateType(value, fieldSchema.type)) {
        errors.push(`Field '${fieldName}' must be of type ${fieldSchema.type}`);
        return errors;
      }
    }

    // Pattern validation
    if (fieldSchema.pattern && typeof value === 'string') {
      if (!fieldSchema.pattern.test(value)) {
        errors.push(`Field '${fieldName}' does not match required pattern`);
      }
    }

    // Enum validation
    if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
      errors.push(`Field '${fieldName}' must be one of: ${fieldSchema.enum.join(', ')}`);
    }

    // Number range validation
    if (fieldSchema.type === 'number') {
      if (fieldSchema.min !== undefined && value < fieldSchema.min) {
        errors.push(`Field '${fieldName}' must be at least ${fieldSchema.min}`);
      }
      if (fieldSchema.max !== undefined && value > fieldSchema.max) {
        errors.push(`Field '${fieldName}' must be at most ${fieldSchema.max}`);
      }
    }

    // Array validation
    if (fieldSchema.type === 'array') {
      if (fieldSchema.minLength !== undefined && value.length < fieldSchema.minLength) {
        errors.push(`Field '${fieldName}' must have at least ${fieldSchema.minLength} items`);
      }
      if (fieldSchema.maxLength !== undefined && value.length > fieldSchema.maxLength) {
        errors.push(`Field '${fieldName}' must have at most ${fieldSchema.maxLength} items`);
      }

      // Validate array items
      if (fieldSchema.itemType) {
        value.forEach((item, index) => {
          if (!this.validateType(item, fieldSchema.itemType)) {
            errors.push(`Item ${index} in '${fieldName}' must be of type ${fieldSchema.itemType}`);
          }
        });
      }

      if (fieldSchema.itemSchema) {
        value.forEach((item, index) => {
          const itemValidation = this.validateObject(item, fieldSchema.itemSchema);
          if (!itemValidation.isValid) {
            errors.push(...itemValidation.errors.map(error => `Item ${index} in '${fieldName}': ${error}`));
          }
        });
      }
    }

    // Object validation
    if (fieldSchema.type === 'object' && fieldSchema.schema) {
      const objectValidation = this.validateObject(value, fieldSchema.schema);
      if (!objectValidation.isValid) {
        errors.push(...objectValidation.errors.map(error => `In '${fieldName}': ${error}`));
      }
    }

    return errors;
  }

  static validateType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'date':
        return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
      default:
        return true;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================
  
  static createDefaultProject(name, autoharpType) {
    return {
      id: this.generateId(),
      name,
      description: '',
      autoharpType,
      progressions: [],
      settings: {
        audioEnabled: false,
        inputMode: 'hybrid',
        showProgressions: true,
        compactMode: false
      },
      metadata: {
        version: '1.0',
        createdAt: new Date(),
        modifiedAt: new Date(),
        author: 'User'
      }
    };
  }

  static createDefaultProgression(name, autoharpType) {
    return {
      id: this.generateId(),
      name,
      chords: [],
      autoharpType,
      tempo: 120,
      timeSignature: '4/4',
      tags: [],
      createdAt: new Date(),
      modifiedAt: new Date()
    };
  }

  static generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  static sanitizeChordName(chordName) {
    if (typeof chordName !== 'string') return '';
    
    // Remove extra whitespace and normalize
    return chordName.trim()
      .replace(/\s+/g, ' ')
      .replace(/([A-G])([#b])/g, '$1$2') // Ensure no space between note and accidental
      .replace(/\s*\/\s*/g, '/'); // Normalize slash chords
  }
}

// Export the class
export { DataSchemas };
