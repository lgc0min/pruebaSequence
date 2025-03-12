/**
 * Formatea una duración en segundos a formato mm:ss
 * @param seconds Duración en segundos
 * @returns Duración formateada en formato mm:ss
 */

export function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  export function parseDuration(duration: string): number {
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
  } 