import LinesHeader from "./LinesHeader";
import LinesTable from "./LinesTable";
import LineFormDialog from "./LineFormDialog";
import DeleteLinesDialog from "./DeleteLinesDialog";

import { Notification } from "../../../components/ui/Notification";
import { LineDetailsModal } from "../../../components/lines/LineDetailsModal";

import { useLinesLogic } from "./useLinesLogic";

const ClientLinesPage = () => {
  const {
    // data
    employees,
    devices,
    filteredLines,

    // states
    loading,
    saving,
    deleteLoading,
    employeesLoading,
    devicesLoading,

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
    selectedLine,
    openDetails,
    closeDetails,

    // form
    dialogOpen,
    dialogMode,
    currentLine,
    formValues,
    formErrors,
    handleOpenCreate,
    handleOpenEdit,
    handleDialogClose,
    handleFormValueChange,
    handleSaveLine,

    // delete dialog
    confirmDeleteOpen,
    handleConfirmDelete,

    // snackbar
    snackbar,
    setSnackbar,
  } = useLinesLogic();

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-slate-600 dark:text-slate-300">
        Cargando líneas...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-6">
      {/* HEADER */}
      <LinesHeader
        search={search}
        onSearchChange={handleSearchChange}
        selectionMode={selectionMode}
        selectedCount={selectedIds.length}
        onDeleteSelected={handleDeleteSelected}
        onCancelSelection={handleCancelSelection}
        onCreateLine={handleOpenCreate}
      />

      {/* TABLE */}
      <LinesTable
        lines={filteredLines}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onEdit={handleOpenEdit}
        onView={openDetails}
      />

      {/* DETAILS MODAL */}
      <LineDetailsModal
        open={detailsOpen}
        line={selectedLine}
        onClose={closeDetails}
      />

      {/* CREATE / EDIT FORM */}
      <LineFormDialog
        open={dialogOpen}
        mode={dialogMode}
        saving={saving}
        currentLine={currentLine}
        formValues={formValues}
        formErrors={formErrors}
        employees={employees}
        employeesLoading={employeesLoading}
        devices={devices}
        devicesLoading={devicesLoading}
        onClose={handleDialogClose}
        onChange={handleFormValueChange}
        onSave={handleSaveLine}
      />

      {/* DELETE CONFIRMATION */}
      <DeleteLinesDialog
        open={confirmDeleteOpen}
        selectedCount={selectedIds.length}
        loading={deleteLoading}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      {/* SNACKBAR */}
      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default ClientLinesPage;
