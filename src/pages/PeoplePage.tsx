import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Person } from '../types';
import { getPeople } from '../api';
import { PeopleFilters } from '../components/PeopleFilters';
import { Loader } from '../components/Loader';
import { PeopleTable } from '../components/PeopleTable';

export const PeoplePage = () => {
  const [peoples, setPeoples] = useState<Person[]>([]);
  const [showLoader, setShowLoader] = useState(true);
  const [showError, setShowError] = useState(false);
  const [searchParams] = useSearchParams();
  const { pathname, search } = useLocation();

  const query = searchParams.get('query') || '';
  const filterBySex = searchParams.get('sex') || '';
  const filterByCentury = searchParams.getAll('centuries') || [];

  let filteredPeoples = [...peoples];
  const normalizeQuery = query.trim().toLowerCase();

  if (normalizeQuery) {
    filteredPeoples = filteredPeoples
      .filter(person => person.name.toLowerCase().includes(query));
  }

  if (filterBySex) {
    filteredPeoples = filteredPeoples
      .filter(person => person.sex === filterBySex);
  }

  if (filterByCentury.length) {
    filteredPeoples = filteredPeoples.filter(person => {
      const century = Math.ceil(person.born / 100);

      return filterByCentury.includes(century.toString());
    });
  }

  useEffect(() => {
    getPeople()
      .then(setPeoples)
      .catch(() => setShowError(true))
      .finally(() => setShowLoader(false));
  }, []);

  return (
    <div className="container">
      <h1 className="title">People Page</h1>
      <p>
        {searchParams}
      </p>
      <p>
        {`pathname: ${pathname}, search: ${search}`}
      </p>

      <div className="block">
        <div className="columns is-desktop is-flex-direction-row-reverse">
          {!!peoples.length && (
            <div className="column is-7-tablet is-narrow-desktop">
              <PeopleFilters />
            </div>
          )}

          <div className="column">
            <div className="box table-container">
              {showLoader ? (
                <Loader />
              ) : (
                <>
                  {showError ? (
                    <p data-cy="peopleLoadingError" className="has-text-danger">
                      Something went wrong
                    </p>
                  ) : (
                    <>
                      {
                        peoples.length ? (
                          <PeopleTable peoples={filteredPeoples} />
                        ) : (
                          <p data-cy="noPeopleMessage">
                            There are no people on the server
                          </p>
                        )
                      }
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
