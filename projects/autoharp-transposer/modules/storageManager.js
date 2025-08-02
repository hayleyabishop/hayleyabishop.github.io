// =============================================================================
// STORAGE MANAGER
// Handles persistence and data storage for the autoharp transposer
// =============================================================================

class StorageManager {
  constructor() {
    this.prefix = 'autoharp_';
    this.version = '1.0';
  }

  // Generic storage methods
  save(key, data) {
    try {
      const storageData = {
        data,
        timestamp: Date.now(),
        version: this.version
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(storageData));
      return true;
    } catch (error) {
      console.warn(`Error saving ${key} to localStorage:`, error);
      return false;
    }
  }

  load(key, defaultValue = null) {
    try {
      const stored = localStorage.getItem(this.prefix + key);
      if (!stored) return defaultValue;
      
      const storageData = JSON.parse(stored);
      
      // Check version compatibility
      if (storageData.version !== this.version) {
        console.warn(`Version mismatch for ${key}, using default`);
        return defaultValue;
      }
      
      return storageData.data;
    } catch (error) {
      console.warn(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.warn(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  }

  exists(key) {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  // Specific data storage methods
  savePreferences(preferences) {
    return this.save('preferences', {
      autoharpType: preferences.autoharpType || 'type21Chord',
      audioEnabled: preferences.audioEnabled || false,
      inputMode: preferences.inputMode || 'hybrid',
      ui: preferences.ui || {}
    });
  }

  loadPreferences() {
    return this.load('preferences', {
      autoharpType: 'type21Chord',
      audioEnabled: false,
      inputMode: 'hybrid',
      ui: {
        showProgressions: true,
        compactMode: false
      }
    });
  }

  saveChordHistory(chords) {
    // Keep only the last 50 chords
    const limitedHistory = Array.isArray(chords) ? chords.slice(0, 50) : [];
    return this.save('chord_history', limitedHistory);
  }

  loadChordHistory() {
    return this.load('chord_history', []);
  }

  addToChordHistory(chord) {
    if (!chord) return false;
    
    const history = this.loadChordHistory();
    
    // Remove if already exists
    const index = history.indexOf(chord);
    if (index > -1) {
      history.splice(index, 1);
    }
    
    // Add to beginning
    history.unshift(chord);
    
    return this.saveChordHistory(history);
  }

  saveChordProgression(name, progression) {
    if (!name || !Array.isArray(progression)) return false;
    
    const progressions = this.loadChordProgressions();
    progressions[name] = {
      chords: progression,
      created: Date.now(),
      lastUsed: Date.now()
    };
    
    return this.save('chord_progressions', progressions);
  }

  loadChordProgressions() {
    return this.load('chord_progressions', {});
  }

  deleteChordProgression(name) {
    const progressions = this.loadChordProgressions();
    delete progressions[name];
    return this.save('chord_progressions', progressions);
  }

  updateProgressionLastUsed(name) {
    const progressions = this.loadChordProgressions();
    if (progressions[name]) {
      progressions[name].lastUsed = Date.now();
      return this.save('chord_progressions', progressions);
    }
    return false;
  }

  // Session data (temporary storage)
  saveSession(sessionData) {
    return this.save('current_session', {
      selectedChords: sessionData.selectedChords || [],
      autoharpType: sessionData.autoharpType || 'type21Chord',
      timestamp: Date.now()
    });
  }

  loadSession() {
    const session = this.load('current_session');
    
    // Check if session is recent (within 24 hours)
    if (session && session.timestamp) {
      const hoursSinceSession = (Date.now() - session.timestamp) / (1000 * 60 * 60);
      if (hoursSinceSession > 24) {
        this.clearSession();
        return null;
      }
    }
    
    return session;
  }

  clearSession() {
    return this.remove('current_session');
  }

  // Statistics and analytics
  saveUsageStats(stats) {
    const currentStats = this.loadUsageStats();
    const updatedStats = {
      ...currentStats,
      ...stats,
      lastUpdated: Date.now()
    };
    return this.save('usage_stats', updatedStats);
  }

  loadUsageStats() {
    return this.load('usage_stats', {
      totalChords: 0,
      totalSessions: 0,
      favoriteChords: {},
      favoriteAutoharpType: 'type21Chord',
      audioUsage: 0,
      textInputUsage: 0,
      buttonInputUsage: 0,
      lastUpdated: Date.now()
    });
  }

  incrementStat(statName, value = 1) {
    const stats = this.loadUsageStats();
    stats[statName] = (stats[statName] || 0) + value;
    return this.saveUsageStats(stats);
  }

  incrementChordUsage(chord) {
    const stats = this.loadUsageStats();
    if (!stats.favoriteChords) stats.favoriteChords = {};
    stats.favoriteChords[chord] = (stats.favoriteChords[chord] || 0) + 1;
    return this.saveUsageStats(stats);
  }

  // Backup and restore
  exportAllData() {
    const allData = {};
    const keys = [
      'preferences',
      'chord_history',
      'chord_progressions',
      'usage_stats'
    ];
    
    keys.forEach(key => {
      const data = this.load(key);
      if (data !== null) {
        allData[key] = data;
      }
    });
    
    return {
      ...allData,
      exportTimestamp: Date.now(),
      version: this.version
    };
  }

  importAllData(importData) {
    if (!importData || typeof importData !== 'object') {
      throw new Error('Invalid import data format');
    }
    
    // Validate version compatibility
    if (importData.version && importData.version !== this.version) {
      console.warn('Version mismatch in import data, proceeding with caution');
    }
    
    const results = {};
    const keys = [
      'preferences',
      'chord_history',
      'chord_progressions',
      'usage_stats'
    ];
    
    keys.forEach(key => {
      if (importData[key]) {
        results[key] = this.save(key, importData[key]);
      }
    });
    
    return results;
  }

  // Cleanup and maintenance
  clearAllData() {
    const keys = [
      'preferences',
      'chord_history',
      'chord_progressions',
      'current_session',
      'usage_stats'
    ];
    
    const results = {};
    keys.forEach(key => {
      results[key] = this.remove(key);
    });
    
    return results;
  }

  getStorageInfo() {
    try {
      const keys = [];
      const sizes = {};
      let totalSize = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          const size = new Blob([value]).size;
          
          keys.push(key);
          sizes[key] = size;
          totalSize += size;
        }
      }
      
      return {
        keys,
        sizes,
        totalSize,
        totalItems: keys.length,
        storageQuota: this.getStorageQuota()
      };
    } catch (error) {
      console.warn('Error getting storage info:', error);
      return null;
    }
  }

  getStorageQuota() {
    try {
      // Estimate localStorage quota (usually 5-10MB)
      let testKey = 'test';
      let testData = '';
      let quota = 0;
      
      // This is a rough estimation method
      try {
        for (let i = 0; i < 1000; i++) {
          testData += '0123456789';
        }
        
        while (true) {
          try {
            localStorage.setItem(testKey, testData);
            localStorage.removeItem(testKey);
            quota += testData.length;
            testData += testData;
          } catch (e) {
            break;
          }
        }
      } catch (e) {
        // Cleanup
        localStorage.removeItem(testKey);
      }
      
      return quota;
    } catch (error) {
      return null;
    }
  }

  // Maintenance tasks
  cleanupOldData() {
    const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Clean up old progressions
    const progressions = this.loadChordProgressions();
    let cleanedProgressions = false;
    
    Object.keys(progressions).forEach(name => {
      const progression = progressions[name];
      if (progression.lastUsed && progression.lastUsed < cutoffTime) {
        delete progressions[name];
        cleanedProgressions = true;
      }
    });
    
    if (cleanedProgressions) {
      this.save('chord_progressions', progressions);
    }
    
    // Trim chord history if too long
    const history = this.loadChordHistory();
    if (history.length > 50) {
      this.saveChordHistory(history.slice(0, 50));
    }
    
    return {
      progressionsCleaned: cleanedProgressions,
      historyTrimmed: history.length > 50
    };
  }

  // =============================================================================
  // PROJECT MANAGEMENT (Interface Methods)
  // =============================================================================
  
  saveProject(projectData) {
    if (!projectData || !projectData.id) {
      console.warn('Cannot save project: missing project data or ID');
      return false;
    }
    
    // Import DataSchemas for validation
    import('./dataSchemas.js').then(({ DataSchemas }) => {
      const validation = DataSchemas.validateProject(projectData);
      if (!validation.isValid) {
        console.warn('Project validation failed:', validation.errors);
        // Continue saving but log warnings
      }
      if (validation.warnings.length > 0) {
        console.info('Project validation warnings:', validation.warnings);
      }
    }).catch(err => {
      console.warn('Could not validate project data:', err);
    });
    
    // Update modification timestamp
    const projectToSave = {
      ...projectData,
      metadata: {
        ...projectData.metadata,
        modifiedAt: new Date(),
        version: projectData.metadata?.version || '1.0'
      }
    };
    
    // Save individual project
    const projectSaved = this.save(`project_${projectData.id}`, projectToSave);
    
    if (projectSaved) {
      // Update project index
      const projectIndex = this.loadProjectIndex();
      projectIndex[projectData.id] = {
        id: projectData.id,
        name: projectData.name,
        autoharpType: projectData.autoharpType,
        modifiedAt: projectToSave.metadata.modifiedAt,
        createdAt: projectData.metadata?.createdAt || projectToSave.metadata.modifiedAt
      };
      
      this.save('project_index', projectIndex);
      console.log(`Project '${projectData.name}' saved successfully`);
    }
    
    return projectSaved;
  }
  
  loadProject(projectId) {
    if (!projectId) {
      console.warn('Cannot load project: missing project ID');
      return null;
    }
    
    const projectData = this.load(`project_${projectId}`, null);
    
    if (projectData) {
      // Import DataSchemas for validation
      import('./dataSchemas.js').then(({ DataSchemas }) => {
        const validation = DataSchemas.validateProject(projectData);
        if (!validation.isValid) {
          console.warn(`Loaded project '${projectId}' has validation errors:`, validation.errors);
        }
      }).catch(err => {
        console.warn('Could not validate loaded project data:', err);
      });
      
      console.log(`Project '${projectData.name}' loaded successfully`);
    } else {
      console.warn(`Project '${projectId}' not found`);
    }
    
    return projectData;
  }
  
  loadProjectIndex() {
    return this.load('project_index', {});
  }
  
  getAllProjects() {
    const projectIndex = this.loadProjectIndex();
    return Object.values(projectIndex).sort((a, b) => 
      new Date(b.modifiedAt) - new Date(a.modifiedAt)
    );
  }
  
  deleteProject(projectId) {
    if (!projectId) {
      console.warn('Cannot delete project: missing project ID');
      return false;
    }
    
    // Remove from project index
    const projectIndex = this.loadProjectIndex();
    const projectInfo = projectIndex[projectId];
    delete projectIndex[projectId];
    this.save('project_index', projectIndex);
    
    // Remove project data
    this.remove(`project_${projectId}`);
    
    if (projectInfo) {
      console.log(`Project '${projectInfo.name}' deleted successfully`);
    }
    
    return true;
  }
  
  // =============================================================================
  // ENHANCED PROGRESSION MANAGEMENT
  // =============================================================================
  
  saveProgressionToProject(projectId, progression) {
    const project = this.loadProject(projectId);
    if (!project) {
      console.warn('Cannot save progression: project not found');
      return false;
    }
    
    // Add or update progression in project
    const progressionIndex = project.progressions.findIndex(p => p.id === progression.id);
    if (progressionIndex >= 0) {
      project.progressions[progressionIndex] = {
        ...progression,
        modifiedAt: new Date()
      };
    } else {
      project.progressions.push({
        ...progression,
        createdAt: new Date(),
        modifiedAt: new Date()
      });
    }
    
    return this.saveProject(project);
  }
  
  removeProgressionFromProject(projectId, progressionId) {
    const project = this.loadProject(projectId);
    if (!project) {
      console.warn('Cannot remove progression: project not found');
      return false;
    }
    
    project.progressions = project.progressions.filter(p => p.id !== progressionId);
    return this.saveProject(project);
  }

  // Migration helpers
  migrateFromOldVersion(oldData) {
    // Handle migration from previous versions
    // This would be implemented based on actual migration needs
    console.log('Migration not implemented yet');
    return false;
  }
}

// Create singleton instance
const storageManager = new StorageManager();

export { StorageManager, storageManager };
