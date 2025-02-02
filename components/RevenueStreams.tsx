import React from "react";

type RevenueStream = {
  name: string;
  value: number;
  color: string;
};

type RevenueStreamsProps = {
  data: RevenueStream[];
};

const RevenueStreams: React.FC<RevenueStreamsProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let currentAngle = 0;

  // Calculate SVG paths for donut segments
  const paths = data.map((item, index) => {
    const percentage = item.value / total;
    const angle = 2 * Math.PI * percentage;

    // Calculate start and end points
    const startX = 100 + radius * Math.cos(currentAngle);
    const startY = 100 + radius * Math.sin(currentAngle);
    const endX = 100 + radius * Math.cos(currentAngle + angle);
    const endY = 100 + radius * Math.sin(currentAngle + angle);

    // Create SVG path
    const largeArcFlag = percentage > 0.5 ? 1 : 0;
    const pathData = [
      `M ${100 + (radius - 20) * Math.cos(currentAngle)} ${
        100 + (radius - 20) * Math.sin(currentAngle)
      }`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L ${100 + (radius - 20) * Math.cos(currentAngle + angle)} ${
        100 + (radius - 20) * Math.sin(currentAngle + angle)
      }`,
      `A ${radius - 20} ${radius - 20} 0 ${largeArcFlag} 0 ${
        100 + (radius - 20) * Math.cos(currentAngle)
      }  ${100 + (radius - 20) * Math.sin(currentAngle)}`,
      "Z",
    ].join(" ");

    const path = {
      d: pathData,
      fill: item.color,
    };

    currentAngle += angle;
    return path;
  });

  return (
    <div className="w-full  p-6 bg-white rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">Revenue Streams</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Chart Section */}
        <div className="h-64 w-full flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full max-w-[256px]">
            {paths.map((path, index) => (
              <path
                key={index}
                d={path.d}
                fill={path.fill}
                className="transition-all duration-300 hover:opacity-90"
              />
            ))}
          </svg>
        </div>

        {/* Legend & Details Section */}
        <div className="space-y-6">
          <p className="text-sm text-blue-600 font-medium">
            See where your money&pos;s coming from
          </p>
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <span className="font-medium text-slate-900">
                  ${item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueStreams;
