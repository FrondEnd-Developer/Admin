'use client';

import isEqual from 'lodash/isEqual';
import { useRef, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { _roles, USER_STATUS_OPTIONS } from 'src/_mock';
import CustomAlert from 'src/layouts/common/custom-alert';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import UserTableRow from '../rest-table-row';
import UserTableToolbar from '../rest-table-toolbar';
import UserTableFiltersResult from '../rest-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'contactNumber', label: 'Contact Number', width: 180 },
  { id: 'location', label: 'Location', width: 220 },
  { id: 'status', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function RestListView() {
  const childFunctionRef = useRef(null);

  const { enqueueSnackbar } = useSnackbar();
  const { deleteRestaurant } = useAuthContext();
  const { restList } = useAuthContext();
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [allRest, setAllRest] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    getAllRest();
  });

  const getAllRest = async () => {
    const result = await restList();
    setAllRest(result.data);
  };

  const dataFiltered = applyFilter({
    inputData: allRest,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // ---------------------------------------------------

  const handleDeleteRow = useCallback(
    async (id) => {
      const deleteRow = allRest.filter((row) => row._id !== id);

      try {
        // const response = await restList();
        const restaurantToDelete = allRest.find((restaurant) => restaurant._id === id);
        const restid = restaurantToDelete._id;
        const result = await deleteRestaurant(restid);
        if (result.status === 200) {
          if (childFunctionRef.current) {
            childFunctionRef.current('Restaurant removed', 'success');
          }
        }

        enqueueSnackbar('Delete success!');

        setAllRest(deleteRow);

        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        enqueueSnackbar('Failed to delete restaurant', { variant: 'error' });
        console.error('Error deleting restaurant:', error);
        if (childFunctionRef.current) {
          console.error('status', childFunctionRef.current);
          childFunctionRef.current(`${error.detail}`, 'error');
        }
      }
    },
    [dataInPage.length, enqueueSnackbar, table, allRest, deleteRestaurant]
  );

  // ---------------------------------------
  const handleDeleteRows = useCallback(() => {
    const deleteRows = allRest.filter((row) => !table.selected.includes(row._id));

    enqueueSnackbar('Delete success!');

    setAllRest(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, allRest]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  return (
    <>
      <CustomAlert childFunctionRef={childFunctionRef} message="Test Registration" type="success" />

      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Cater', href: paths.dashboard.root },
            { name: 'List' },
          ]}
          action={
            <Button
              variant="contained"
              href={paths.dashboard.cater.new}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Restaurant
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={
                      (tab.value === 'true' && 'success') ||
                      (tab.value === 'false' && 'error') ||
                      'default'
                    }
                  >
                    {['true', 'pending', 'false', 'rejected'].includes(tab.value)
                      ? allRest.filter((user) => user.status === tab.value).length
                      : allRest.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            roleOptions={_roles}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row._id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row._id)
                    )
                  }
                />

                <TableBody>
                  {dataInPage.map((row) => (
                    <UserTableRow
                      key={row._id}
                      row={row}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onDeleteRow={() => handleDeleteRow(row._id)}
                      onEditRow={() => handleEditRow(row._id)}
                    />
                  ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status, role } = filters;

  let filteredData = inputData;

  if (name) {
    filteredData = filteredData.filter(
      (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    filteredData = filteredData.filter((user) => user.status === status);
  }

  if (role.length) {
    filteredData = filteredData.filter((user) => role.includes(user.role));
  }

  return filteredData.sort((a, b) => {
    const order = comparator(a, b);
    return order !== 0 ? order : a.id - b.id;
  });
}
