"use client";

import ContentLoader from 'react-content-loader';
import { Card, CardContent, Typography, Tooltip, IconButton, Box } from '@mui/material';
import { ArrowUpward, ArrowDownward, InfoOutlined } from '@mui/icons-material';
import { Sparklines, SparklinesCurve } from 'react-sparklines';
import type { SxProps } from '@mui/material';
import type { ChartPreviewData } from '@/lib/types';

interface ChartPreviewProps {
    obj: ChartPreviewData | null;
    icon: React.ReactNode;
    label: string;
    sx?: SxProps;
    iconBg?: string;
    suffix?: string;
}

const ChartSkeleton = ({ sx }: { sx?: SxProps }) => (
    <Card sx={{ borderRadius: '6px', border: '1px solid #eef0f4', boxShadow: '0 1px 2px rgba(0,0,0,0.06)', width: '100%', ...sx }}>
        <CardContent>
            <ContentLoader
                speed={2}
                width={'100%'}
                height={108}
                viewBox="0 0 400 108"
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
            >
                <rect x="0" y="8" rx="10" ry="10" width="44" height="44" />
                <rect x="56" y="12" rx="3" ry="3" width="140" height="8" />
                <rect x="56" y="28" rx="3" ry="3" width="90" height="18" />
                <rect x="0" y="64" rx="4" ry="4" width="72" height="14" />
                <rect x="0" y="88" rx="3" ry="3" width="100%" height="10" />
            </ContentLoader>
        </CardContent>
    </Card>
);

function ChartPreview({ obj, icon, label, sx, iconBg = '#6366f1', suffix = '' }: ChartPreviewProps) {
    if (!obj)
        return <ChartSkeleton sx={sx} />;

    const total = obj.total;
    const data = (obj.data ? Object.values(obj.data) : []) as number[];
    const difference = obj.difference;
    const isPositive = obj.trend === 'positive';

    const formatted = total.toLocaleString('it-IT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const trendColor = isPositive ? '#10b981' : '#ef4444';
    const iconBgLight = iconBg + '1a'; // ~10% opacity tint
    const infoText = "In caso di statistica di vendite i dati visualizzati riguardano solo gli ordini marcati come \"Completati\", ovvero un ordine è marcato come completato soltanto dopo che il prodotto è stato consegnato dal corriere al cliente.";

    return (
        <Card sx={{
            borderRadius: '6px',
            border: '1px solid #eef0f4',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            position: 'relative',
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: '0 4px 10px rgba(0,0,0,0.06)' },
            ...sx
        }}>
            {/* Info button */}
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                <Tooltip title={infoText} arrow placement="left">
                    <IconButton size="small">
                        <InfoOutlined fontSize="small" sx={{ color: '#c4c8d0' }} />
                    </IconButton>
                </Tooltip>
            </Box>

            <CardContent sx={{ pb: '14px !important' }}>
                {/* Top row: icon + label + value */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{
                        backgroundColor: iconBgLight,
                        borderRadius: '6px',
                        width: 44,
                        height: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        '& .MuiSvgIcon-root': { color: iconBg },
                    }}>
                        {icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ color: '#64748b', fontSize: '16px', fontWeight: 500, lineHeight: 1.3 }}>
                            {label}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '22px', color: '#13131f', lineHeight: 1.3, mt: 0.25 }}>
                            {formatted}{suffix}
                        </Typography>
                    </Box>
                </Box>

                {/* Trend badge */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5, gap: 0.75 }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.25,
                        backgroundColor: trendColor + '1a',
                        borderRadius: '6px',
                        px: 0.75, py: 0.25
                    }}>
                        {isPositive
                            ? <ArrowUpward sx={{ fontSize: 13, color: trendColor }} />
                            : <ArrowDownward sx={{ fontSize: 13, color: trendColor }} />}
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: trendColor }}>
                            {difference}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '14px', color: '#94a3b8' }}>
                        vs periodo prec.
                    </Typography>
                </Box>

                {/* Sparkline */}
                <Box sx={{ mt: 1.5 }}>
                    <Sparklines data={data.length ? data : [0, 0]} height={38} margin={3}>
                        <SparklinesCurve color={trendColor} />
                    </Sparklines>
                </Box>
            </CardContent>
        </Card>
    );
}

export default ChartPreview;
