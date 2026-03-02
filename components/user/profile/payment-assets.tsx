"use client";

import { Button, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { Delete, Edit } from "@mui/icons-material";
import { showToast } from "@/lib/utils/notifications";
import { createAsset, createAssetWithEmail, deleteAsset, fetchAllAssets } from "@/lib/api/partners";
import AssetDialog from "./asset-dialog";

interface Asset {
  id: number;
  iban: string;
  vatNumber?: string;
  percentage: number;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  entityType: string;
  fiscalCode?: string;
}

export default function PaymentAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [freePercentage, setFreePercentage] = useState(100);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Record<string, unknown> | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetchAllAssets();
      const mapped: Asset[] = res.data.map((a: Record<string, unknown>) => ({
        id: a.id, iban: a.iban, vatNumber: a.vat_number, percentage: a.percentage,
        companyName: a.company_name, firstName: a.first_name, lastName: a.last_name,
        entityType: a.entity_type, fiscalCode: a.fiscal_code,
      }));
      setAssets(mapped);
      setFreePercentage(100 - mapped.reduce((acc, c) => acc + Number(c.percentage), 0));
    })();
  }, []);

  const handleOpenDialog = () => {
    if (freePercentage > 0) {
      setEditingAsset(null);
      setEditingIndex(null);
      setOpenDialog(true);
    }
    else showToast("Non c'è piu percentuale disponibile!", "error");
  };

  const handleEditAsset = (index: number) => {
    const asset = assets[index];
    setEditingAsset({
      entityType: asset.entityType,
      companyName: asset.companyName ?? "",
      vatNumber: asset.vatNumber ?? "",
      fiscalCode: asset.fiscalCode ?? "",
      iban: asset.iban,
      email: "", address: "", city: "", zipCode: "",
    });
    setEditingIndex(index);
    setFreePercentage((prev) => prev + Number(asset.percentage));
    setOpenDialog(true);
  };

  const handleDeleteAsset = (index: number) => {
    const asset = assets[index];
    const newAssets = assets.filter((_, i) => i !== index);
    setAssets(newAssets);
    setFreePercentage(100 - newAssets.reduce((acc, c) => acc + Number(c.percentage), 0));
    deleteAsset(asset.id);
  };

  const handleSubmit = (formData: Record<string, unknown>) => {
    if (editingIndex !== null) {
      const oldAsset = assets[editingIndex];
      deleteAsset(oldAsset.id);
      setAssets((prev) => prev.filter((_, i) => i !== editingIndex));
    }
    setFreePercentage((p) => p - Number(formData.percentage));
    if (formData.entityType === "individual") {
      createAssetWithEmail(formData.email as string, formData.percentage as number);
    } else {
      setAssets((p) => [...p, formData as unknown as Asset]);
      createAsset({
        entity_type: formData.entityType as string, iban: formData.iban as string,
        vat_number: formData.vatNumber as string, address: formData.fullAddress as string,
        fiscal_code: formData.fiscalCode as string, percentage: formData.percentage as number,
        company_name: formData.companyName as string, first_name: formData.firstName as string,
        last_name: formData.lastName as string,
      });
    }
    setEditingAsset(null);
    setEditingIndex(null);
  };

  const renderAsset = (asset: Asset, index: number) => (
    <div key={`card-${index}`} className="relative rounded-2xl text-white min-w-[320px] p-5" style={{ background: "linear-gradient(135deg, #1e1e30 0%, #13131f 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex">
        <IconButton size="small" color="error" onClick={() => handleDeleteAsset(index)}><Delete sx={{ fontSize: 18 }} /></IconButton>
        <IconButton size="small" className="text-white!" onClick={() => handleEditAsset(index)}><Edit sx={{ fontSize: 18 }} /></IconButton>
      </div>

      <p className="text-[11px] text-gray-400 uppercase tracking-wide m-0">IBAN</p>
      <p className="text-base tracking-wide mt-1 mb-3">{asset.iban}</p>

      {asset.vatNumber ? (
        <><p className="text-[11px] text-gray-400 uppercase tracking-wide m-0">Partita IVA</p><p className="text-sm mt-1 mb-3">{asset.vatNumber}</p></>
      ) : (
        <><p className="text-[11px] text-gray-400 uppercase tracking-wide m-0">Codice Fiscale</p><p className="text-sm mt-1 mb-3">{asset.fiscalCode}</p></>
      )}

      <p className="text-[11px] text-gray-400 uppercase tracking-wide m-0">Percentuale</p>
      <p className="text-sm mt-1 mb-2">{asset.percentage}%</p>
      <p className="text-sm font-medium mt-1">{asset.entityType === "company" ? asset.companyName : `${asset.firstName} ${asset.lastName}`}</p>
    </div>
  );

  return (
    <div className="dash-card p-7 min-h-120 relative">
      {/* Header */}
      <h2 className="text-xl font-bold tracking-tight text-center mb-1">Gestisci Pagamenti</h2>
      <p className="text-sm text-slate-500 text-center mb-3">
        In questa sezione puoi visualizzare i tuoi pagamenti, aggiungere un nuovo metodo di pagamento e gestire i tuoi asset
      </p>

      <hr className="border-0 border-t border-[#eef0f4] my-5" />

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold m-0">Asset di pagamento</h3>
        <Button variant="contained" color="secondary" onClick={handleOpenDialog} sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, px: 2.5 }}>Aggiungi</Button>
      </div>

      <AssetDialog
        open={openDialog}
        onAdd={handleSubmit}
        onClose={() => {
          setOpenDialog(false);
          if (editingIndex !== null) {
            const asset = assets[editingIndex];
            if (asset) setFreePercentage((prev) => prev - Number(asset.percentage));
            setEditingAsset(null);
            setEditingIndex(null);
          }
        }}
        freePercentage={freePercentage}
        initialData={editingAsset}
        isEditing={editingIndex !== null}
      />

      {assets.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-slate-400 text-sm">Non hai registrato ancora nessun asset di pagamento</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">{assets.map(renderAsset)}</div>
      )}
    </div>
  );
}
