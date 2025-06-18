let webContainerInstance = null;

export async function getWebContainer() {
  if (!webContainerInstance) {
    try {
      // Check if we have the required environment
      if (typeof SharedArrayBuffer === 'undefined') {
        throw new Error('SharedArrayBuffer is not available');
      }
      
      if (!window.crossOriginIsolated) {
        throw new Error('Cross-origin isolation is required');
      }

      const { WebContainer } = await import('@webcontainer/api');
      webContainerInstance = await WebContainer.boot();
    } catch (error) {
      console.error('Failed to initialize WebContainer:', error);
      throw error;
    }
  }
  return webContainerInstance;
}