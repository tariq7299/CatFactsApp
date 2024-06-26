import { useMemo } from 'react';
import DataTable from 'react-data-table-component';
import './InternetCatFactsTable.scss';
import { ProgressBar } from 'react-loader-spinner';
import { useState, useEffect } from 'react';
import CatButton from '../common/CatButton/CatButton';
import { internetCatApiInstance } from '../../helper/axiosInstances';

const InternetCatFactsTable = () => {
  // This for the actula facts fetched from the public API
  const [internetCatFacts, setInternetCatFacts] = useState([]);

  // This to keep track for the page beng shown to user ! so it is used for pagination purposes
  const [currentPage, setCurrentPage] = useState(1);

  // This will show a loading indecator
  const [isLoadingInternetFacts, setIsLoadingInternetFacts] = useState(false);

  // If error when fetching the facts !, so this will make me show an error message instead of the actual table
  const [isErrorFetchingInternetCatFacts, setIsErrorFetchingInternetCatFacts] =
    useState(false);

  // Fetching facts from the public api
  useEffect(() => {
    const fetchInternetCatFacts = async () => {
      setIsErrorFetchingInternetCatFacts(false);
      setIsLoadingInternetFacts(true);
      try {
        // TASK #1 : Fetch data from an API
        // Use Axios
        // Handle errors

        const response = await internetCatApiInstance.get(`?page=${currentPage}&max_length=70`)

        // Simulate a delay of 0.6 seconds
        // This will make the UX much better
        setInternetCatFacts(response.data);
        const loadingTimer = setTimeout(() => {
          setIsLoadingInternetFacts(false);
        }, 600);

        return () => clearTimeout(loadingTimer);
      } catch (error) {
        setIsErrorFetchingInternetCatFacts(true);
        console.error('Error fetching data:', error);
      }

      setIsLoadingInternetFacts(false);
    };

    fetchInternetCatFacts();
  }, [currentPage]);

  // THis will handle the previous page button
  const handlePrevPage = () => {
    if (internetCatFacts.prev_page_url) {
      setCurrentPage(currentPage - 1);
    }
  };

  // This will handle the next page button
  const handleNextPage = () => {
    if (internetCatFacts.next_page_url) {
      setCurrentPage(currentPage + 1);
    }
  };

  // THis will cache the fetched facts for better performance
  const internetCatFactsWithIds = useMemo(() => {
    if (!internetCatFacts.data) return [];
    return internetCatFacts.data.map((row, index) => ({
      ...row,
      id: index + 1,
    }));
  }, [internetCatFacts]);

  // THis will apply my custom css/styles to the table headers
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
      name: 'ID',
      selector: (row) => row.id,
      sortable: true,
      width: '85px',
      cell: (row) => <div className="custom-font">{row.id}</div>,
    },
    {
      name: 'Fact',
      selector: (row) => row.fact,
      sortable: true,
      cell: (row) => <div className="custom-font">{row.fact}</div>,
    },
  ];

  return (
    <div className="Internetfacts-table-container">
      <h1>
        {' '}
        Get Ready to Paws 🐾 Here Are Some Whisker-tastic Cat Facts from the
        internet!
      </h1>

      {/* If error then show only error
          If loaind so show only loadin
          If not Error nor Loading then finally show the actual table wiht the fetched data
      */}
      {isErrorFetchingInternetCatFacts ? (
        <div className="error-message">
          Error fetching Internet Cat Facts !!! Please contact support !
        </div>
      ) : isLoadingInternetFacts ? (
        <div className="progress-bar-container">
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
        <>
          <DataTable
            columns={columns}
            data={internetCatFactsWithIds}
            customStyles={tableCustomStyles}
          />

          {/* THe pagination buttons */}
          <div className="pagination-buttons-container">
            <CatButton
              handleOnClick={handlePrevPage}
              isDisabled={!internetCatFacts.prev_page_url}
              text="Previous"
            ></CatButton>
            <CatButton
              handleOnClick={handleNextPage}
              isDisabled={!internetCatFacts.next_page_url}
              text="Next"
            ></CatButton>
          </div>
        </>
      )}
    </div>
  );
};

export default InternetCatFactsTable;
