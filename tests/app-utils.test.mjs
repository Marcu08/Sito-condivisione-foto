import { describe, it, expect } from 'vitest';

// Extract and test the pure utility functions from app.js
// These are re-implemented here to test the logic, since app.js relies on DOM globals.

const UPLOAD_MARKER = '/upload/';

function cloudinaryUrl(url, transform) {
  if (!url || !url.includes(UPLOAD_MARKER)) return url;
  return url.replace(/\/upload\/(?:[^/]+\/)*?/, `${UPLOAD_MARKER}${transform}/`);
}

function thumbUrl(url) {
  return cloudinaryUrl(url, 'w_600,q_auto,f_auto');
}

function displayUrl(url) {
  return cloudinaryUrl(url, 'w_1600,q_auto,f_auto');
}

function downloadUrl(url) {
  return cloudinaryUrl(url, 'fl_attachment,q_auto,f_auto');
}

function galleryPhotos(g, unlockedGalleries = {}) {
  if (g.protected) {
    return unlockedGalleries[g.id] || [];
  }
  return g.photos || [];
}

function photoCount(g, unlockedGalleries = {}) {
  if (g.protected) {
    const unlocked = unlockedGalleries[g.id];
    return unlocked ? unlocked.length : g.photoCount || null;
  }
  return (g.photos || []).length;
}

describe('cloudinaryUrl', () => {
  it('should return the url unchanged if it does not contain /upload/', () => {
    expect(cloudinaryUrl('https://example.com/image.jpg', 'w_600')).toBe('https://example.com/image.jpg');
  });

  it('should return the url unchanged for null/undefined/empty', () => {
    expect(cloudinaryUrl(null, 'w_600')).toBe(null);
    expect(cloudinaryUrl(undefined, 'w_600')).toBe(undefined);
    expect(cloudinaryUrl('', 'w_600')).toBe('');
  });

  it('should insert transform after /upload/ preserving version', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1234/photo.jpg';
    const result = cloudinaryUrl(url, 'w_600,q_auto,f_auto');
    expect(result).toBe('https://res.cloudinary.com/demo/image/upload/w_600,q_auto,f_auto/v1234/photo.jpg');
  });

  it('should prepend transform before existing path segments', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/w_200,h_200/v1234/photo.jpg';
    const result = cloudinaryUrl(url, 'w_1600,q_auto,f_auto');
    expect(result).toBe('https://res.cloudinary.com/demo/image/upload/w_1600,q_auto,f_auto/w_200,h_200/v1234/photo.jpg');
  });

  it('should handle URLs without version segment', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/photo.jpg';
    const result = cloudinaryUrl(url, 'w_600');
    expect(result).toBe('https://res.cloudinary.com/demo/image/upload/w_600/photo.jpg');
  });
});

describe('thumbUrl', () => {
  it('should apply w_600,q_auto,f_auto transform', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg';
    expect(thumbUrl(url)).toBe('https://res.cloudinary.com/demo/image/upload/w_600,q_auto,f_auto/v1/photo.jpg');
  });
});

describe('displayUrl', () => {
  it('should apply w_1600,q_auto,f_auto transform', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg';
    expect(displayUrl(url)).toBe('https://res.cloudinary.com/demo/image/upload/w_1600,q_auto,f_auto/v1/photo.jpg');
  });
});

describe('downloadUrl', () => {
  it('should apply fl_attachment,q_auto,f_auto transform', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg';
    expect(downloadUrl(url)).toBe('https://res.cloudinary.com/demo/image/upload/fl_attachment,q_auto,f_auto/v1/photo.jpg');
  });
});

describe('galleryPhotos', () => {
  it('should return photos array for non-protected gallery', () => {
    const g = { id: 'test', protected: false, photos: ['a.jpg', 'b.jpg'] };
    expect(galleryPhotos(g)).toEqual(['a.jpg', 'b.jpg']);
  });

  it('should return empty array for non-protected gallery without photos', () => {
    const g = { id: 'test', protected: false };
    expect(galleryPhotos(g)).toEqual([]);
  });

  it('should return unlocked photos for protected gallery when unlocked', () => {
    const g = { id: 'private-1', protected: true };
    const unlocked = { 'private-1': ['secret1.jpg', 'secret2.jpg'] };
    expect(galleryPhotos(g, unlocked)).toEqual(['secret1.jpg', 'secret2.jpg']);
  });

  it('should return empty array for protected gallery that is not unlocked', () => {
    const g = { id: 'private-1', protected: true };
    expect(galleryPhotos(g, {})).toEqual([]);
  });
});

describe('photoCount', () => {
  it('should return count of photos for non-protected gallery', () => {
    const g = { id: 'test', protected: false, photos: ['a.jpg', 'b.jpg', 'c.jpg'] };
    expect(photoCount(g)).toBe(3);
  });

  it('should return 0 for non-protected gallery without photos', () => {
    const g = { id: 'test', protected: false };
    expect(photoCount(g)).toBe(0);
  });

  it('should return unlocked count for protected gallery that is unlocked', () => {
    const g = { id: 'priv', protected: true, photoCount: 50 };
    const unlocked = { priv: ['a.jpg', 'b.jpg'] };
    expect(photoCount(g, unlocked)).toBe(2);
  });

  it('should return photoCount field for protected gallery that is not unlocked', () => {
    const g = { id: 'priv', protected: true, photoCount: 42 };
    expect(photoCount(g, {})).toBe(42);
  });

  it('should return null for protected gallery without photoCount and not unlocked', () => {
    const g = { id: 'priv', protected: true };
    expect(photoCount(g, {})).toBe(null);
  });
});
