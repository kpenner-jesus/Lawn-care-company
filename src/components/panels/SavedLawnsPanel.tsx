import { useState } from 'react';
import { useCanvasState, useCanvasDispatch } from '../../state/canvas-context';
import type { SavedLawn } from '../../types/lawn';
import { formatArea } from '../../utils/units';
import { polygonArea } from '../../utils/geometry';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export function SavedLawnsPanel() {
  const state = useCanvasState();
  const dispatch = useCanvasDispatch();
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');

  const handleSave = () => {
    if (!saveName.trim() || !state.mainPolygon) return;

    const lawn: SavedLawn = {
      id: `lawn-${Date.now()}`,
      name: saveName.trim(),
      mainPolygon: state.mainPolygon,
      subtractionZones: state.subtractionZones,
      bundleSizeId: state.activeBundleSizeId,
      overage: state.overage,
      unitSystem: state.unitSystem,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    dispatch({ type: 'SAVE_LAWN', lawn });
    setSaveName('');
    setShowSave(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Saved Lawns</p>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowSave(true)}
          disabled={!state.mainPolygon}
        >
          + Save Current
        </Button>
      </div>

      {state.savedLawns.length === 0 && (
        <p className="text-xs text-gray-400 py-2">No saved lawns yet</p>
      )}

      <div className="space-y-1.5">
        {state.savedLawns.map((lawn) => {
          const area = lawn.mainPolygon.isClosed ? polygonArea(lawn.mainPolygon.vertices) : 0;
          return (
            <div
              key={lawn.id}
              className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{lawn.name}</p>
                <p className="text-xs text-gray-500">
                  {formatArea(area, state.unitSystem)} &middot;{' '}
                  {new Date(lawn.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => dispatch({ type: 'LOAD_LAWN', lawn })}
              >
                Load
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => dispatch({ type: 'DELETE_LAWN', lawnId: lawn.id })}
              >
                Del
              </Button>
            </div>
          );
        })}
      </div>

      <Modal open={showSave} onClose={() => setShowSave(false)} title="Save Lawn">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lawn Name</label>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g., Front Yard"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowSave(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" onClick={handleSave} className="flex-1" disabled={!saveName.trim()}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
