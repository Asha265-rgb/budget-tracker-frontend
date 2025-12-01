import React from 'react';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: 'sm' | 'md' | 'lg';
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 'md',
  color = colors.primary[500],
  backgroundColor = colors.gray[200],
  showLabel = false,
  labelPosition = 'inside',
}) => {
  const heightMap = {
    sm: '4px',
    md: '8px',
    lg: '12px',
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div style={{ width: '100%' }}>
      {showLabel && labelPosition === 'outside' && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: spacing[2],
          fontSize: '14px',
          color: colors.text.secondary
        }}>
          <span>Progress</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      
      <div
        style={{
          width: '100%',
          height: heightMap[height],
          backgroundColor,
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${clampedProgress}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: '9999px',
            transition: 'width 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {showLabel && labelPosition === 'inside' && clampedProgress >= 40 && (
            <span
              style={{
                color: colors.text.white,
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              {clampedProgress}%
            </span>
          )}
        </div>
      </div>

      {showLabel && labelPosition === 'inside' && clampedProgress < 40 && (
        <div style={{ 
          textAlign: 'right', 
          marginTop: spacing[2],
          fontSize: '14px',
          color: colors.text.secondary
        }}>
          {clampedProgress}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;