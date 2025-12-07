import { CircularProgress } from "@mui/material";
import { Notification } from "../../../components/ui/Notification";
import { DeviceDetailsModal } from "../../../components/devices/DeviceDetailsModal";

import DevicesHeader from "./DevicesHeader";
import DevicesTable from "./DevicesTable";
import DeviceFormDialog from "./DeviceFormDialog";
import DeleteDevicesDialog from "./DeleteDevicesDialog";
import { useDevicesLogic } from "./useDevicesLogic";

const ClientDevicesPage = () => {
  const {
    clientId,
    devices,
    filteredDevices,
    selectedDevice,

    // loading
    loading,
    saving,
    linesLoading,
    employeesLoading,
    deleteLoading,

    // search
    search,
    handleSearchChange,

    // selection
    selectionMode,
    selectedIds,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    handleSelectOne,
    handleDeleteSelected,
    handleCancelSelection,
    handleCloseDeleteDialog,

    // details
    detailsOpen,
    openDetails,
    closeDetails,

    // form dialog
    dialogOpen,
    dialogMode,
    currentDevice,
    formValues,
    formErrors,
    selectableLines,
    handleOpenCreate,
    handleOpenEdit,
    handleDialogClose,
    handleFormValueChange,
    handleSaveDevice,

    // delete dialog
    confirmDeleteOpen,
    handleConfirmDelete,

    // table
    tableColumnCount,

    // extra data
    employees,

    // snackbar
    snackbar,
    setSnackbar,
  } = useDevicesLogic();

  if (!clientId) {
    return (
      <div className="p-6">
        <p className="text-sm font-medium text-red-600">
          No se ha encontrado el cliente actual.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4 sm:p-6">
      <DevicesHeader
        search={search}
        onSearchChange={handleSearchChange}
        selectionMode={selectionMode}
        selectedCount={selectedIds.length}
        onDeleteSelected={handleDeleteSelected}
        onCancelSelection={handleCancelSelection}
        onCreateDevice={handleOpenCreate}
      />

      <DevicesTable
        devices={devices}
        filteredDevices={filteredDevices}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onEditDevice={handleOpenEdit}
        onViewDevice={openDetails}
        tableColumnCount={tableColumnCount}
      />

      <DeviceFormDialog
        open={dialogOpen}
        mode={dialogMode}
        saving={saving}
        currentDevice={currentDevice}
        formValues={formValues}
        formErrors={formErrors}
        selectableLines={selectableLines}
        linesLoading={linesLoading}
        employees={employees}
        employeesLoading={employeesLoading}
        onClose={handleDialogClose}
        onChangeField={handleFormValueChange}
        onSave={handleSaveDevice}
      />

      <DeleteDevicesDialog
        open={confirmDeleteOpen}
        loading={deleteLoading}
        selectedCount={selectedIds.length}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      <DeviceDetailsModal
        open={detailsOpen}
        device={selectedDevice}
        onClose={closeDetails}
      />

      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default ClientDevicesPage;
