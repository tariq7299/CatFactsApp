import { useMemo } from 'react';
import DataTable from 'react-data-table-component';
import './UsersCatFactsTable.scss';
import { ProgressBar } from 'react-loader-spinner';
import { usersCatApiInstance } from '../../helper/axiosInstances';
import axios from 'axios';
import { useAuth } from '../../hooks/AuthProvider';
import { useAlert } from '../../hooks/AlertProvider';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ExitIcon from '../common/Icons/ExitIcon';
import PencilIcon from '../common/Icons/PencilIcon';
import TrashIcon from '../common/Icons/TrashIcon';
import SaveIcon from '../common/Icons/SaveIcon';

import errorHandler from '../../helper/helperFunctions';

// Importing usersFacts context
import { useUsersFacts } from '../../hooks/UsersFactsProvider';

// THis the second table where it will show the cat facts users added to the site, so it is not from a public API and instead it is from my server and DB
const UsersCatFactsTable = () => {
  const {
    setUsersCatFacts,
    usersCatFacts,
    isLoadingUsersFacts,
    isErrorFetchingUsersCatFacts,
  } = useUsersFacts();

  const { getUserData } = useAuth();

  const { register, handleSubmit, reset } = useForm();

  const username = useMemo(() => {
    return getUserData();
  }, [getUserData]);

  const { addAlert } = useAlert();

  const navigate = useNavigate();

  // THis funcion will handle when users click on the delete button to try to delete a fact !
  // It will send DELETE request to server with the fact ID
  const handleDeletUserCatFact = async (factId) => {
    try {

      const response = await usersCatApiInstance.delete(`facts/${factId}`);

      if (response.status === 200 || response.status === 204) {
        addAlert('Cat Fact Deleted ❗️', 'warning');

        setUsersCatFacts([...usersCatFacts.filter((fact) => fact?.factId !== factId)]);


      } else {
        throw new Error();
      }
    } catch (error) {
      errorHandler(error, addAlert, navigate)
    }
  };

  function handleEditCatFact(factId) {
    setUsersCatFacts(
      usersCatFacts.map((userFact) => {
        if (userFact.factId === factId) {
          return { ...userFact, editMode: !userFact.editMode ?? true };
        } else {
          return userFact;
        }
      })
    );
  }

  const handleSubmittingUpdatedFact = async (data, factId) => {

    try {
      reset();
      // Extract the value of the textarea with the key corresponding to the factId
      const updatedCatFact = data[`user-cat-fact-${factId}`];

      // If the updatedCatFact is not found, return early
      if (!updatedCatFact) {
        return;
      }

      // Prepare the data to be sent in the PUT request
      const requestData = { updatedCatFact };

      const response = await usersCatApiInstance.put(`/facts/${factId}`, requestData);

      if (response.status === 200 || response.status === 204) {
        // Here ima updating the cat facts without refetching them from server !

        setUsersCatFacts(
          usersCatFacts.map((userCatFact) => {
            if (userCatFact.factId === factId) {
              // Return the updated object with the new catFact
              return {
                ...userCatFact,
                catFact: updatedCatFact,
                editMode: false,
              };
            }
            // Return the unchanged object if factId does not match
            return userCatFact;
          })
        );

        addAlert('Cat Fact updated 👍', 'info');
      } else {
        // Throw an error if the response status is unexpected
        throw new Error();
      }
    } catch (error) {
      errorHandler(error, addAlert, navigate)
    }
  };

  const tableCustomStyles = {
    headCells: {
      style: {
        fontSize: '28px',
        fontWeight: 'bold',
        paddingLeft: '0 8px',
        justifyContent: 'center',
        backgroundColor: '#FFA500',
      },
    },
  };

  // TASK #3 : Display Data using React Data Table Compoenet
  // Use Sorting, filtring, and paginatation in the table
  // Use React Data Table Component
  const columns = [
    {
      name: 'User',
      selector: (row) => row.owner,
      sortable: true,
      width: '85px',
      cell: (row) => (
        <div className="row-owner-wrapper custom-font">
          {row.owner.toLowerCase() === username ? <span>Me</span> : row.owner}
        </div>
      ),
    },
    {
      name: 'Fact',
      selector: (row) => row.catFact,
      sortable: true,
      cell: (row) => (
        <div className="custom-font">
          {row.editMode ? (
            <textarea
              type="text"
              id={`user-cat-fact-${row.factId}`}
              name={`user-cat-fact-${row.factId}`}
              defaultValue={row.catFact}
              {...register(`user-cat-fact-${row.factId}`, { required: true })}
            ></textarea>
          ) : (
            <>{row.catFact}</>
          )}
        </div>
      ),
    },
    {
      name: 'Action',
      width: '85px',
      cell: (row) => (
        <div className="icon-button-container custom-font">
          {row.owner.toLowerCase() === username ? (
            <>
              <button onClick={() => handleDeletUserCatFact(row.factId)}>
                <TrashIcon />
              </button>
              <button onClick={() => handleEditCatFact(row.factId)}>
                {row.editMode ? <ExitIcon /> : <PencilIcon />}
              </button>{' '}
              {row.editMode && (
                <button
                  onClick={handleSubmit((data) =>
                    handleSubmittingUpdatedFact(data, row.factId)
                  )}
                >
                  <SaveIcon />
                </button>
              )}
            </>
          ) : (
            ''
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="users-cat-facts-table-container">
      <h1>
        {' '}
        Want more Paw-some Adventure?<br></br> Dive into Our User-Generated Cat
        Facts! 🙋{' '}
      </h1>

      {isErrorFetchingUsersCatFacts ? (
        <div className="error-message">
          Error fetching Users Cat Facts !!! Please contact support !
        </div>
      ) : isLoadingUsersFacts ? (
        <div className="progress-bar-container">
          {' '}
          <ProgressBar
            visible={true}
            height="80"
            width="80"
            barColor="#fff"
            borderColor="#ffda6a"
            ariaLabel="progress-bar-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={usersCatFacts}
          customStyles={tableCustomStyles}
        />
      )}
    </div>
  );
};

export default UsersCatFactsTable;
