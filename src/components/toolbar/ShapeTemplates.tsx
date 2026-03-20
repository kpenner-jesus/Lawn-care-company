import { useCanvasDispatch, useCanvasState } from '../../state/canvas-context';
import { SHAPE_TEMPLATES, placeTemplate } from '../../utils/templates';

export function ShapeTemplates() {
  const state = useCanvasState();
  const dispatch = useCanvasDispatch();

  const handleSelect = (templateId: string) => {
    const template = SHAPE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    // Place centered at world origin (viewport will center on it)
    const vertices = placeTemplate(template, { x: 0, y: 0 });

    if (state.mode === 'place-subtract') {
      // Place as subtraction zone
      dispatch({
        type: 'ADD_SUBTRACTION',
        zone: {
          id: `sub-${Date.now()}`,
          vertices,
          isClosed: true,
          label: template.name,
        },
      });
    } else {
      // Place as main polygon
      dispatch({
        type: 'PLACE_SHAPE',
        polygon: {
          id: `main-${Date.now()}`,
          vertices,
          isClosed: true,
        },
      });
    }
  };

  const isSubtract = state.mode === 'place-subtract';

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        {isSubtract ? 'Add area to subtract' : 'Choose your yard shape'}
      </p>
      <div className="grid grid-cols-5 gap-2">
        {SHAPE_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSelect(t.id)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200
              hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100 transition-colors"
          >
            <span className="text-2xl leading-none">{t.icon}</span>
            <span className="text-[10px] text-gray-600 font-medium">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
