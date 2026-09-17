'use client';

import React, { useState } from 'react';
import styles from './create.module.css';

interface FormProps {
  destinations: Array<{ id: string; name: string }>;
  experiences: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string; level: string }>;
}

export default function CreateJourneyForm({ destinations, experiences, locations }: FormProps) {
  const [title, setTitle] = useState('');
  const [subheading, setSubheading] = useState('');
  const [brief, setBrief] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [destinationId, setDestinationId] = useState(destinations[0]?.id || '');
  const [locationId, setLocationId] = useState(locations[0]?.id || '');
  const [selectedExpIds, setSelectedExpIds] = useState<string[]>([]);
  const [tags, setTags] = useState('Nature, Solo Riding, Western Ghats');
  
  // Media states
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [coverIndex, setCoverIndex] = useState(0);

  // AI Drawer state
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiFacts, setAiFacts] = useState<string[]>([]);
  const [aiSources, setAiSources] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleExperience = (id: string) => {
    if (selectedExpIds.includes(id)) {
      setSelectedExpIds(selectedExpIds.filter(e => e !== id));
    } else {
      setSelectedExpIds([...selectedExpIds, id]);
    }
  };

  const addImageUrl = () => {
    const url = prompt('Enter Image URL:');
    if (url && url.startsWith('http')) {
      setImageUrls([...imageUrls, url]);
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
    if (coverIndex === index) {
      setCoverIndex(0);
    }
  };

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery })
      });
      const data = await res.json();
      if (data.facts) {
        setAiFacts(data.facts);
        setAiSources(data.sources || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!title || !subheading || !brief || !bodyText) {
      setError('Please fill all required heading, subheading, and story content fields.');
      return;
    }
    if (selectedExpIds.length === 0) {
      setError('Please select at least 1 approved experience category.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subheading', subheading);
    formData.append('brief', brief);
    formData.append('body_rich_text', bodyText);
    formData.append('destination_id', destinationId);
    formData.append('location_id', locationId);
    formData.append('status', status);
    formData.append('experience_ids', JSON.stringify(selectedExpIds));
    formData.append('tags', tags);
    formData.append('image_urls', JSON.stringify(imageUrls));
    formData.append('cover_index', coverIndex.toString());

    try {
      const res = await fetch('/api/journeys', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create journey');
      }

      window.location.href = `/journeys/${data.journeyId}`;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.formGrid}>
      <div className={styles.mainForm}>
        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.fieldGroup}>
          <label>Journey Heading *</label>
          <input
            type="text"
            placeholder="e.g. Monsoon Solo Ride to Abbey Falls"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.textInput}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Subheading *</label>
          <input
            type="text"
            placeholder="e.g. Navigating misty mountain bends and coffee slopes on two wheels"
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
            className={styles.textInput}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Short Brief *</label>
          <textarea
            placeholder="Brief introduction overview for journey cards..."
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={2}
            className={styles.textareaInput}
          />
        </div>

        <div className={styles.rowTwo}>
          <div className={styles.fieldGroup}>
            <label>Destination *</label>
            <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)} className={styles.selectInput}>
              {destinations.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label>Location Node *</label>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className={styles.selectInput}>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.level})</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label>Select Experiences (1+ Required) *</label>
          <div className={styles.expPillsRow}>
            {experiences.map(e => (
              <button
                type="button"
                key={e.id}
                onClick={() => toggleExperience(e.id)}
                className={`${styles.expPill} ${selectedExpIds.includes(e.id) ? styles.expPillSelected : ''}`}
              >
                {selectedExpIds.includes(e.id) ? '✓ ' : ''}{e.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label>Tags (Comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className={styles.textInput}
          />
        </div>

        {/* MEDIA UPLOADER */}
        <div className={styles.fieldGroup}>
          <div className={styles.mediaHeader}>
            <label>Story Photography & Cover Image</label>
            <button type="button" onClick={addImageUrl} className={styles.addMediaBtn}>+ Add Photo URL</button>
          </div>

          <div className={styles.mediaGrid}>
            {imageUrls.map((url, idx) => (
              <div key={idx} className={`${styles.mediaCard} ${coverIndex === idx ? styles.coverCard : ''}`}>
                <img src={url} alt={`Upload ${idx}`} />
                <div className={styles.mediaOverlay}>
                  <button type="button" onClick={() => setCoverIndex(idx)} className={styles.coverBtn}>
                    {coverIndex === idx ? '⭐ Cover' : 'Set Cover'}
                  </button>
                  <button type="button" onClick={() => removeImageUrl(idx)} className={styles.removeBtn}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STORY RICH TEXT BODY */}
        <div className={styles.fieldGroup}>
          <label>Story Content (Rich Text Body HTML) *</label>
          <textarea
            placeholder="<p>Write your detailed travel experience narrative here...</p>"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={10}
            className={styles.textareaInput}
          />
        </div>

        {/* ACTIONS */}
        <div className={styles.actionsRow}>
          <button type="button" onClick={() => handleSubmit('DRAFT')} disabled={loading} className={styles.draftBtn}>
            Save Draft
          </button>
          <button type="button" onClick={() => handleSubmit('PUBLISHED')} disabled={loading} className={styles.publishBtn}>
            {loading ? 'Publishing...' : 'Publish Journey'}
          </button>
        </div>
      </div>

      {/* ISOLATED AI RESEARCH SIDE DRAWER */}
      <div className={styles.aiSidePanel}>
        <div className={styles.aiPanelHeader}>
          <h3>💡 AI Travel Assistant</h3>
          <p>Contextual research facts display separately and will NEVER auto-insert into your draft.</p>
        </div>

        <div className={styles.aiSearchBox}>
          <input
            type="text"
            placeholder="Query (e.g. History of Hampi)"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            className={styles.aiInput}
          />
          <button type="button" onClick={handleAiSearch} disabled={aiLoading} className={styles.aiBtn}>
            {aiLoading ? '...' : 'Search'}
          </button>
        </div>

        {aiFacts.length > 0 && (
          <div className={styles.aiResultsBox}>
            <h4>Research Insights</h4>
            <ul>
              {aiFacts.map((fact, i) => (
                <li key={i}>{fact}</li>
              ))}
            </ul>
            {aiSources.length > 0 && (
              <div className={styles.aiSources}>
                <small>Sources: {aiSources.join(', ')}</small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
