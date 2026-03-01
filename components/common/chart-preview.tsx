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
}

const ChartSkeleton = () => (
    <Card sx={{ borderRadius: 2, boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }}>
        <CardContent>
            <ContentLoader
                speed={2}
                width={'100%'}
                height={100}
                viewBox="0 0 400 100"
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
            >
                <rect x="0" y="10" rx="4" ry="4" width="50" height="50" />
                <rect x="60" y="10" rx="3" ry="3" width="200" height="10" />
                <rect x="60" y="30" rx="3" ry="3" width="100" height="20" />
                <rect x="0" y="70" rx="3" ry="3" width="300" height="20" />
            </ContentLoader>
        </CardContent>
    </Card>
);

function ChartPreview({ obj, icon, label, sx }: ChartPreviewProps) {
    if (!obj)
        return <ChartSkeleton />;

    const total = obj.total;
    const data = Object.values(obj.data);
    const difference = obj.difference;
    const type = obj.trend;

    const formatted = total.toLocaleString('it-IT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const infoText = "In caso di statistica di vendite i dati visualizzati riguardano solo gli ordini marcati come \"Completati\", ovvero un ordine è marcato come completato soltanto dopo che il prodotto è stato consegnato dal corriere al cliente.";

    return (
        <Card sx={{
            borderRadius: 2,
            boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
            position: 'relative',
            ...sx
        }}>

            {/* ICONA INFO POSIZIONATA ASSOLUTAMENTE */}
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                <Tooltip title={infoText} arrow placement="left">
                    <IconButton size="small">
                        <InfoOutlined fontSize="small" color="disabled" />
                    </IconButton>
                </Tooltip>
            </Box>

            <CardContent>
                <div className="d-flex align-center">
                    <div className="bg-danger p-1 rounded">
                        {icon}
                    </div>
                    <div className="ms-3">
                        <Typography variant="body2" color="textSecondary">
                            {label}
                        </Typography>
                        <Typography variant="h5" className="fw-bold">
                            {formatted}
                        </Typography>
                    </div>
                </div>

                <div className="mt-2 d-flex align-center">
                    {type === 'positive' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                    <Typography variant="body2" className="ms-1">
                        {difference}
                    </Typography>
                </div>

                <div className={'mt-2'}>
                    <Sparklines data={data} height={30} margin={5}>
                        <SparklinesCurve color={type === 'positive' ? 'green' : 'red'} />
                    </Sparklines>
                </div>
            </CardContent>
        </Card>
    );
}

export default ChartPreview;
