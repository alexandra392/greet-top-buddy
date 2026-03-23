import { Card } from './ui/card';
import { ResponsiveFunnel } from '@nivo/funnel';

interface CustomPathway {
  feedstock: string;
  technology: string;
  product: string;
  application: string;
  trl: string;
  category1: string;
  category2: string;
  category3: string;
  category4: string;
  patents?: string;
  isCustom?: boolean;
  timeToMarket?: string;
}

interface PortfolioFunnelChartProps {
  pathways: CustomPathway[];
  selectedStage?: string;
  onStageSelect?: (stage: string | null) => void;
}

export const PortfolioFunnelChart = ({ pathways, selectedStage, onStageSelect }: PortfolioFunnelChartProps) => {
  const researchCount = 29;
  const labCount = 22;
  const pilotCount = 15;
  const commercialCount = 11;

  const data = [
    { id: 'Commercial', value: commercialCount, label: 'Commercial', timeToMarket: 'Now - 2 years' },
    { id: 'Pilot', value: pilotCount, label: 'Pilot', timeToMarket: '3–5 years' },
    { id: 'Lab', value: labCount, label: 'Lab', timeToMarket: '5–10 years' },
    { id: 'R&D', value: researchCount, label: 'R&D', timeToMarket: '10+ years' },
  ];

  const totalPathways = researchCount + labCount + pilotCount + commercialCount;

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Identified Pathways: {totalPathways} Pathways
        </h3>
        <p className="text-sm text-gray-600">
          These pathways are across different development stages. <strong className="text-gray-900">Click on any stage to filter and view pathways.</strong>
        </p>
      </div>
      
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-gray-300" />
          <span className="text-xs font-bold text-gray-700 tracking-wider">
            TIMELINE FOR IMPLEMENTATION →
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gray-300 to-gray-300" />
        </div>
      </div>
      
      <div style={{ height: '260px' }}>
        <ResponsiveFunnel
          data={data}
          margin={{ top: 0, right: 20, bottom: 0, left: 20 }}
          direction="horizontal"
          valueFormat=" >-.0f"
          colors={['#A8D5A8', '#B8DDB8', '#C8E5C8', '#D8EDD8']}
          borderWidth={2}
          borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
          borderOpacity={1}
          labelColor="white"
          beforeSeparatorLength={30}
          beforeSeparatorOffset={20}
          afterSeparatorLength={30}
          afterSeparatorOffset={20}
          currentPartSizeExtension={10}
          currentBorderWidth={3}
          onClick={(part) => {
            onStageSelect?.(selectedStage === part.data.id ? null : part.data.id);
          }}
          motionConfig="gentle"
          tooltip={({ part }) => (
            <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
              <p className="font-semibold text-gray-900">{part.data.label}</p>
              <p className="text-sm text-gray-600">{part.data.value} pathways</p>
              <p className="text-xs text-gray-500">{part.data.timeToMarket}</p>
            </div>
          )}
        />
      </div>
      
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">Commercial</p>
          <p className="text-xs text-gray-500 mt-1">{commercialCount} pathways</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">Pilot</p>
          <p className="text-xs text-gray-500 mt-1">{pilotCount} pathways</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">Lab</p>
          <p className="text-xs text-gray-500 mt-1">{labCount} pathways</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">R&D</p>
          <p className="text-xs text-gray-500 mt-1">{researchCount} pathways</p>
        </div>
      </div>
      
      {selectedStage && (
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Filtered by:</strong> {selectedStage} stage - Click the stage again to clear filter
          </p>
        </div>
      )}
    </Card>
  );
};
