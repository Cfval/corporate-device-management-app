import { CircularProgress } from "@mui/material";
import { Notification } from "../../../components/ui/Notification";
import UsersHeader from "./UsersHeader";
import UsersTable from "./UsersTable";
import UserFormDialog from "./UserFormDialog";
import DeleteUsersDialog from "./DeleteUsersDialog";
import { useUsersLogic } from "./useUsersLogic";

const ClientUsersPage = () => {
  const {
    clientId,
    users,
    loading,
    search,
    handleSearchChange,
    filteredUsers,
    selectionMode,
    selected,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    handleSelectOne,
    dialogOpen,
    dialogMode,
    currentUser,
    formValues,
    formErrors,
    saving,
    selectableLines,
    linesLoading,
    handleOpenCreate,
    handleOpenEdit,
    handleDialogClose,
    handleFormValueChange,
    handleSaveUser,
    handleDeleteSelected,
    handleCancelSelection,
    handleCloseDeleteDialog,
    confirmDeleteOpen,
    deleteLoading,
    handleConfirmDelete,
    snackbar,
    handleSnackbarClose,
    tableColumnCount,
  } = useUsersLogic();

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
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <UsersHeader
        search={search}
        onSearchChange={handleSearchChange}
        selectionMode={selectionMode}
        selectedCount={selected.length}
        onDeleteSelected={handleDeleteSelected}
        onCancelSelection={handleCancelSelection}
        onCreateUser={handleOpenCreate}
      />

      <UsersTable
        users={users}
        filteredUsers={filteredUsers}
        selectionMode={selectionMode}
        selectedIds={selected}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onEditUser={handleOpenEdit}
        tableColumnCount={tableColumnCount}
      />

      <UserFormDialog
        open={dialogOpen}
        mode={dialogMode}
        saving={saving}
        currentUser={currentUser}
        formValues={formValues}
        formErrors={formErrors}
        selectableLines={selectableLines}
        linesLoading={linesLoading}
        onClose={handleDialogClose}
        onChangeField={handleFormValueChange}
        onSave={handleSaveUser}
      />

      <DeleteUsersDialog
        open={confirmDeleteOpen}
        loading={deleteLoading}
        selectedCount={selected.length}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </div>
  );
};

export default ClientUsersPage;
