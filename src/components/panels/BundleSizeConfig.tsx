import { useState } from 'react';
import { useCanvasState, useCanvasDispatch } from '../../state/canvas-context';
import type { BundleSize } from '../../types/settings';
import { convertLength, toMetres, formatLength } from '../../utils/units';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export function BundleSizeConfig() {
  const state = useCanvasState();
  const dispatch = useCanvasDispatch();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Sod Bundle Size</p>
        <Button size="sm" variant="ghost" onClick={() => setShowAdd(true)}>
          + Add Size
        </Button>
      </div>

      <div className="space-y-1.5">
        {state.bundleSizes.map((b) => (
          <div
            key={b.id}
            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors
              ${b.id === state.activeBundleSizeId
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
            onClick={() => dispatch({ type: 'SET_ACTIVE_BUNDLE', bundleSizeId: b.id })}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{b.name}</p>
              <p className="text-xs text-gray-500">
                {formatLength(b.width, state.unitSystem)} x {formatLength(b.height, state.unitSystem)}
                {b.isDefault && <span className="ml-1 text-blue-600">(default)</span>}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {!b.isDefault && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SET_DEFAULT_BUNDLE', bundleSizeId: b.id }); }}
                >
                  Set Default
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); setEditId(b.id); }}
              >
                Edit
              </Button>
              {state.bundleSizes.length > 1 && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_BUNDLE_SIZE', bundleSizeId: b.id }); }}
                >
                  Del
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <BundleSizeModal
          unitSystem={state.unitSystem}
          onSave={(b) => { dispatch({ type: 'ADD_BUNDLE_SIZE', bundleSize: b }); setShowAdd(false); }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editId && (
        <BundleSizeModal
          unitSystem={state.unitSystem}
          initial={state.bundleSizes.find((b) => b.id === editId)}
          onSave={(b) => { dispatch({ type: 'UPDATE_BUNDLE_SIZE', bundleSize: b }); setEditId(null); }}
          onClose={() => setEditId(null)}
        />
      )}
    </div>
  );
}

function BundleSizeModal({ initial, unitSystem, onSave, onClose }: {
  initial?: BundleSize;
  unitSystem: 'metric' | 'imperial';
  onSave: (b: BundleSize) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [width, setWidth] = useState(
    initial ? String(convertLength(initial.width, unitSystem).toFixed(2)) : ''
  );
  const [height, setHeight] = useState(
    initial ? String(convertLength(initial.height, unitSystem).toFixed(2)) : ''
  );

  const unit = unitSystem === 'imperial' ? 'ft' : 'm';

  const handleSubmit = () => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (!name.trim() || isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return;

    onSave({
      id: initial?.id ?? `bundle-${Date.now()}`,
      name: name.trim(),
      width: toMetres(w, unitSystem),
      height: toMetres(h, unitSystem),
      isDefault: initial?.isDefault ?? false,
    });
  };

  return (
    <Modal open onClose={onClose} title={initial ? 'Edit Bundle Size' : 'Add Bundle Size'}>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Large Roll"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width ({unit})</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="1.0"
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height ({unit})</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="1.0"
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} className="flex-1">
            {initial ? 'Update' : 'Add'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
