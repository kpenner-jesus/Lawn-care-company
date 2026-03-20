import { useState } from 'react';
import { useCanvasState } from '../state/canvas-context';
import { DrawingCanvas } from './canvas/DrawingCanvas';
import { Toolbar } from './toolbar/Toolbar';
import { ShapeTemplates } from './toolbar/ShapeTemplates';
import { CalculationPanel } from './panels/CalculationPanel';
import { UnitToggle } from './panels/UnitToggle';
import { BundleSizeConfig } from './panels/BundleSizeConfig';
import { OverageSlider } from './panels/OverageSlider';
import { SavedLawnsPanel } from './panels/SavedLawnsPanel';

export function SodCalculator() {
  const state = useCanvasState();
  const hasShape = !!state.mainPolygon;
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex flex-col h-[100dvh] max-w-7xl mx-auto lg:flex-row">
      {/* Canvas area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top bar */}
        <div className="px-3 py-2 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-base font-bold text-gray-900">Sod Calculator</h1>
            <UnitToggle />
          </div>
          <Toolbar />
        </div>

        {/* Canvas */}
        <div className="flex-1 min-h-0 relative">
          <DrawingCanvas />

          {/* Shape picker overlay when no shape */}
          {!hasShape && state.mode !== 'place-subtract' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-lg p-5 mx-4 max-w-sm w-full">
                <ShapeTemplates />
              </div>
            </div>
          )}

          {/* Subtraction shape picker overlay */}
          {state.mode === 'place-subtract' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-lg p-5 mx-4 max-w-sm w-full">
                <ShapeTemplates />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side panel (bottom on mobile, right on desktop) */}
      <div className="lg:w-80 lg:border-l border-t lg:border-t-0 border-gray-200 bg-white overflow-y-auto">
        {/* Calculation results - always visible */}
        <div className="p-3 border-b border-gray-100">
          <CalculationPanel />
        </div>

        {/* Collapsible settings */}
        <div className="p-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 py-1"
          >
            <span>Settings</span>
            <span className="text-gray-400">{showSettings ? '▲' : '▼'}</span>
          </button>

          {showSettings && (
            <div className="space-y-4 mt-3">
              <OverageSlider />
              <BundleSizeConfig />
              <SavedLawnsPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
