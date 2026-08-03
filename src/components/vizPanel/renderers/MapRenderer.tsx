import React, { useEffect, useMemo, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { boundsOf, IGeoFeature, isLonLatBounds, toFeatures } from './geo';

const PALETTE = [
  '#1565c0',
  '#2e7d32',
  '#c62828',
  '#6a1b9a',
  '#ef6c00',
  '#00838f'
];

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function popupContent(properties: Record<string, unknown> | undefined) {
  const el = document.createElement('div');
  el.style.maxHeight = '160px';
  el.style.overflowY = 'auto';
  const entries = Object.entries(properties ?? {});
  if (entries.length === 0) {
    el.textContent = '(no properties)';
    return el;
  }
  for (const [k, v] of entries) {
    const row = document.createElement('div');
    const key = document.createElement('strong');
    key.textContent = k;
    row.appendChild(key);
    row.appendChild(document.createTextNode(`: ${String(v)}`));
    el.appendChild(row);
  }
  return el;
}

export function MapRenderer({ text }: { text: string }) {
  const geoJson = useMemo(() => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }, [text]);
  const features = useMemo<IGeoFeature[]>(() => toFeatures(geoJson), [geoJson]);
  const bounds = useMemo(() => boundsOf(features), [features]);
  const hasBasemap = bounds !== null && isLonLatBounds(bounds);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || features.length === 0) {
      return;
    }

    const map = L.map(el, {
      crs: hasBasemap ? L.CRS.EPSG3857 : L.CRS.Simple,
      center: [0, 0],
      zoom: 2,
      minZoom: hasBasemap ? 1 : -10
    });
    if (hasBasemap) {
      L.tileLayer(TILE_URL, {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 19
      }).addTo(map);
    }

    let colorIndex = 0;
    const styleFor = () => {
      const color = PALETTE[colorIndex++ % PALETTE.length];
      return { color, weight: 2, fillColor: color, fillOpacity: 0.4 };
    };
    const layer = L.geoJSON(geoJson, {
      style: styleFor,
      pointToLayer: (_feature, latlng) =>
        L.circleMarker(latlng, {
          ...styleFor(),
          radius: 6,
          weight: 1,
          color: '#fff',
          fillOpacity: 0.9
        }),
      onEachFeature: (feature, l) =>
        l.bindPopup(popupContent(feature?.properties))
    }).addTo(map);

    const layerBounds = layer.getBounds();
    if (layerBounds.isValid()) {
      map.fitBounds(layerBounds.pad(0.1), {
        maxZoom: hasBasemap ? 16 : undefined
      });
    }

    // Leaflet caches the container size at init; the panel is resizable, so
    // the map must be told whenever that size actually changes.
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(el);

    return () => {
      observer.disconnect();
      map.remove();
    };
  }, [geoJson, features, hasBasemap]);

  if (features.length === 0) {
    return <Alert severity="warning">No geographic features to display.</Alert>;
  }

  return (
    <Box>
      {!hasBasemap && (
        <Alert severity="info" sx={{ mb: 1 }}>
          Coordinates are outside the WGS84 longitude/latitude range (projected
          CRS?) — displaying without a basemap.
        </Alert>
      )}
      <Box
        ref={containerRef}
        sx={{
          height: 420,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          isolation: 'isolate'
        }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5, display: 'block' }}
      >
        {features.length} feature{features.length === 1 ? '' : 's'} · scroll to
        zoom, drag to pan, click to inspect
      </Typography>
    </Box>
  );
}
