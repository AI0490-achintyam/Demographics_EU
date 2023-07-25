'''
Instructions:
-------------
To use this code, follow the steps below:

1. Install the required dependencies:
   - numpy: `pip install numpy`
   - pandas: `pip install pandas`
   - argparse: `pip install argparse`

2. Ensure that you have the necessary input files:
   - `file1.txt`: Path to the file containing CBG documents within the radius.
   - `file2.txt` (optional): Path to an optional second file with user queried census variables.

3. Run the code using the command-line interface.
    Command Line Usage:
    ------------------
    1) If user queries for any selected census variables:
       $ python CBG_census_aggregator.py file1.txt file2.txt
    
    2) If user requests for all census variables:
       $ python CBG_census_aggregator.py file1.txt
       python CBG_census_aggregator.py CBG_census_documents.txt

'''

import base64
import sys
import argparse

import json
import copy
import itertools

from math import sqrt
import pandas as pd
import numpy as np


# List of all census variables:
allcolsLst = ['B01003_E001', 'B01003_M001', 'B02001_E001', 'B02001_E002', 'B02001_E003', 'B02001_E004', 'B02001_E005', 'B02001_E006', 'B02001_E007', 'B02001_E008', 'B02001_E009', 'B02001_E010', 'B02001_M001', 'B02001_M002', 'B02001_M003', 'B02001_M004', 'B02001_M005', 'B02001_M006', 'B02001_M007', 'B02001_M008', 'B02001_M009', 'B02001_M010', 'B03003_E001', 'B03003_E002', 'B03003_E003', 'B03003_M001', 'B03003_M002', 'B03003_M003', 'B07201_E001', 'B07201_E002', 'B07201_E003', 'B07201_E004', 'B07201_E007', 'B07201_E010', 'B07201_E013', 'B07201_E014', 'B07201_M001', 'B07201_M002', 'B07201_M003', 'B07201_M004', 'B07201_M007', 'B07201_M010', 'B07201_M013', 'B07201_M014', 'B07202_E001', 'B07202_E002', 'B07202_E003', 'B07202_E004', 'B07202_E007', 'B07202_E010', 'B07202_E013', 'B07202_E014', 'B07202_M001', 'B07202_M002', 'B07202_M003', 'B07202_M004', 'B07202_M007', 'B07202_M010', 'B07202_M013', 'B07202_M014', 'B07203_E001', 'B07203_E002', 'B07203_E003', 'B07203_E004', 'B07203_E007', 'B07203_E010', 'B07203_E011', 'B07203_M001', 'B07203_M002', 'B07203_M003', 'B07203_M004', 'B07203_M007', 'B07203_M010', 'B07203_M011', 'B11001_E001', 'B11001_E002', 'B11001_E003', 'B11001_E004', 'B11001_E005', 'B11001_E006', 'B11001_E007', 'B11001_E008', 'B11001_E009', 'B11001_M001', 'B11001_M002', 'B11001_M003', 'B11001_M004', 'B11001_M005', 'B11001_M006', 'B11001_M007', 'B11001_M008', 'B11001_M009', 'B11012_E001', 'B11012_E002', 'B11012_E003', 'B11012_E004', 'B11012_E005', 'B11012_E006', 'B11012_E007', 'B11012_E008', 'B11012_E009', 'B11012_E010', 'B11012_E011', 'B11012_E012', 'B11012_E013', 'B11012_E014', 'B11012_E015', 'B11012_E016', 'B11012_E017', 'B11012_M001', 'B11012_M002', 'B11012_M003', 'B11012_M004', 'B11012_M005', 'B11012_M006', 'B11012_M007', 'B11012_M008', 'B11012_M009', 'B11012_M010', 'B11012_M011', 'B11012_M012', 'B11012_M013', 'B11012_M014', 'B11012_M015', 'B11012_M016', 'B11012_M017', 'B12001_E001', 'B12001_E002', 'B12001_E003', 'B12001_E004', 'B12001_E005', 'B12001_E006', 'B12001_E007', 'B12001_E008', 'B12001_E009', 'B12001_E010', 'B12001_E011', 'B12001_E012', 'B12001_E013', 'B12001_E014', 'B12001_E015', 'B12001_E016', 'B12001_E017', 'B12001_E018', 'B12001_E019', 'B12001_M001', 'B12001_M002', 'B12001_M003', 'B12001_M004', 'B12001_M005', 'B12001_M006', 'B12001_M007', 'B12001_M008', 'B12001_M009', 'B12001_M010', 'B12001_M011', 'B12001_M012', 'B12001_M013', 'B12001_M014', 'B12001_M015', 'B12001_M016', 'B12001_M017', 'B12001_M018', 'B12001_M019', 'B17010_E001', 'B17010_E002', 'B17010_E003', 'B17010_E004', 'B17010_E005', 'B17010_E006', 'B17010_E007', 'B17010_E008', 'B17010_E009', 'B17010_E010', 'B17010_E011', 'B17010_E012', 'B17010_E013', 'B17010_E014', 'B17010_E015', 'B17010_E016', 'B17010_E017', 'B17010_E018', 'B17010_E019', 'B17010_E020', 'B17010_E021', 'B17010_E022', 'B17010_E023', 'B17010_E024', 'B17010_E025', 'B17010_E026', 'B17010_E027', 'B17010_E028', 'B17010_E029', 'B17010_E030', 'B17010_E031', 'B17010_E032', 'B17010_E033', 'B17010_E034', 'B17010_E035', 'B17010_E036', 'B17010_E037', 'B17010_E038', 'B17010_E039', 'B17010_E040', 'B17010_E041', 'B17010_M001', 'B17010_M002', 'B17010_M003', 'B17010_M004', 'B17010_M005', 'B17010_M006', 'B17010_M007', 'B17010_M008', 'B17010_M009', 'B17010_M010', 'B17010_M011', 'B17010_M012', 'B17010_M013', 'B17010_M014', 'B17010_M015', 'B17010_M016', 'B17010_M017', 'B17010_M018', 'B17010_M019', 'B17010_M020', 'B17010_M021', 'B17010_M022', 'B17010_M023', 'B17010_M024', 'B17010_M025', 'B17010_M026', 'B17010_M027', 'B17010_M028', 'B17010_M029', 'B17010_M030', 'B17010_M031', 'B17010_M032', 'B17010_M033', 'B17010_M034', 'B17010_M035', 'B17010_M036', 'B17010_M037', 'B17010_M038', 'B17010_M039', 'B17010_M040', 'B17010_M041', 'B19001_E001', 'B19001_E002', 'B19001_E003', 'B19001_E004', 'B19001_E005', 'B19001_E006', 'B19001_E007', 'B19001_E008', 'B19001_E009', 'B19001_E010', 'B19001_E011', 'B19001_E012', 'B19001_E013', 'B19001_E014', 'B19001_E015', 'B19001_E016', 'B19001_E017', 'B19001_M001', 'B19001_M002', 'B19001_M003', 'B19001_M004', 'B19001_M005', 'B19001_M006', 'B19001_M007', 'B19001_M008', 'B19001_M009', 'B19001_M010', 'B19001_M011', 'B19001_M012', 'B19001_M013', 'B19001_M014', 'B19001_M015', 'B19001_M016', 'B19001_M017', 'B19013_E001', 'B19013_M001', 'B19301_E001', 'B19301_M001', 'B21001_E001', 'B21001_E002', 'B21001_E003', 'B21001_M001', 'B21001_M002', 'B21001_M003', 'B23025_E001', 'B23025_E002', 'B23025_E003', 'B23025_E004', 'B23025_E005', 'B23025_E006', 'B23025_E007', 'B23025_M001', 'B23025_M002', 'B23025_M003', 'B23025_M004', 'B23025_M005', 'B23025_M006', 'B23025_M007', 'B25001_E001', 'B25001_M001', 'B25002_E001', 'B25002_E002', 'B25002_E003', 'B25002_M001', 'B25002_M002', 'B25002_M003', 'B25003_E001', 'B25003_E002', 'B25003_E003', 'B25003_M001', 'B25003_M002', 'B25003_M003', 'B25010_E001', 'B25010_E002', 'B25010_E003', 'B25010_M001', 'B25010_M002', 'B25010_M003', 'B25024_E001', 'B25024_E002', 'B25024_E003', 'B25024_E004', 'B25024_E005', 'B25024_E006', 'B25024_E007', 'B25024_E008', 'B25024_E009', 'B25024_E010', 'B25024_E011', 'B25024_M001', 'B25024_M002', 'B25024_M003', 'B25024_M004', 'B25024_M005', 'B25024_M006', 'B25024_M007', 'B25024_M008', 'B25024_M009', 'B25024_M010', 'B25024_M011', 'B25034_E001', 'B25034_E002', 'B25034_E003', 'B25034_E004', 'B25034_E005', 'B25034_E006', 'B25034_E007', 'B25034_E008', 'B25034_E009', 'B25034_E010', 'B25034_E011', 'B25034_M001', 'B25034_M002', 'B25034_M003', 'B25034_M004', 'B25034_M005', 'B25034_M006', 'B25034_M007', 'B25034_M008', 'B25034_M009', 'B25034_M010', 'B25034_M011', 'B25064_E001', 'B25064_M001', 'B25077_E001', 'B25077_M001', 'B25081_E001', 'B25081_E002', 'B25081_E009', 'B25081_M001', 'B25081_M002', 'B25081_M009', 'B26001_E001', 'B26001_M001', 'D_B01001_E001', 'D_B01001_E002', 'D_B01001_E003', 'D_B01001_E004', 'D_B01001_E005', 'D_B01001_E006', 'D_B01001_E007', 'D_B01001_E008', 'D_B01001_E009', 'D_B01001_E010', 'D_B01001_E011', 'D_B01001_E012', 'D_B01001_E013', 'D_B01001_E014', 'D_B01001_E015', 'D_B01001_E016', 'D_B01001_E017', 'D_B01001_E018', 'D_B01001_E019', 'D_B01001_E020', 'D_B01001_E021', 'D_B01001_E022', 'D_B01001_E023', 'D_B01001_E024', 'D_B01001_M001', 'D_B01001_M002', 'D_B01001_M003', 'D_B01001_M004', 'D_B01001_M005', 'D_B01001_M006', 'D_B01001_M007', 'D_B01001_M008', 'D_B01001_M009', 'D_B01001_M010', 'D_B01001_M011', 'D_B01001_M012', 'D_B01001_M013', 'D_B01001_M014', 'D_B01001_M015', 'D_B01001_M016', 'D_B01001_M017', 'D_B01001_M018', 'D_B01001_M019', 'D_B01001_M020', 'D_B01001_M021', 'D_B01001_M022', 'D_B01001_M023', 'D_B01001_M024', 'D_B14007_E001', 'D_B14007_E002', 'D_B14007_E003', 'D_B14007_E004', 'D_B14007_E005', 'D_B14007_E006', 'D_B14007_E007', 'D_B14007_E008', 'D_B14007_E009', 'D_B14007_E010', 'D_B14007_M001', 'D_B14007_M002', 'D_B14007_M003', 'D_B14007_M004', 'D_B14007_M005', 'D_B14007_M006', 'D_B14007_M007', 'D_B14007_M008', 'D_B14007_M009', 'D_B14007_M010', 'D_B15003_E001', 'D_B15003_E002', 'D_B15003_E003', 'D_B15003_E004', 'D_B15003_E005', 'D_B15003_E006', 'D_B15003_E007', 'D_B15003_E008', 'D_B15003_E009', 'D_B15003_M001', 'D_B15003_M002', 'D_B15003_M003', 'D_B15003_M004', 'D_B15003_M005', 'D_B15003_M006', 'D_B15003_M007', 'D_B15003_M008', 'D_B15003_M009', 'F_B01003_E001', 'F_B01003_E002', 'F_B01003_E003', 'F_B01003_M001', 'F_B01003_M002', 'F_B01003_M003']

# the base variables:
total_population = 'B01003_E001'
total_households = 'B11001_E001'
housing_units = 'B25001_E001'

groupQuarters_population = 'B26001_E001'

# derived variables - Population universe
age_distribution = [i for i in allcolsLst if 'B01001_E' in i]
school_enrollment = [i for i in allcolsLst if 'B14007_E' in i]
education_attainment = [i for i in allcolsLst if 'B15003_E' in i]
race = [i for i in allcolsLst if 'B02001_E' in i]
hisp = [i for i in allcolsLst if 'B03003_E' in i]
marital_Status = [i for i in allcolsLst if 'B12001_E' in i]
veteran_status = [i for i in allcolsLst if 'B21001_E' in i]
employment_status = [i for i in allcolsLst if 'B23025_E' in i]
mobility_metro = [i for i in allcolsLst if 'B07201_E' in i]
mobility_micro = [i for i in allcolsLst if 'B07202_E' in i]
mobility_not_msa = [i for i in allcolsLst if 'B07203_E' in i]

# populaton forecasts: Population universe.
forecast_estimatesLst = [i for i in allcolsLst if 'F_B01003_E' in i]


# derived variables - housing units universe
occupancy_status = [i for i in allcolsLst if 'B25002_E' in i]
tenure = [i for i in allcolsLst if 'B25003_E' in i]
units_in_structure = [i for i in allcolsLst if 'B25024_E' in i]
year_structure_built = [i for i in allcolsLst if 'B25034_E' in i]
mortgage_status = [i for i in allcolsLst if 'B25081_E' in i]
avg_hh_size_of_occ_hu = [i for i in allcolsLst if 'B25010_E' in i]


# derived variables - households universe
householdsType = [i for i in allcolsLst if 'B11001_E' in i]
households_byType = [i for i in allcolsLst if 'B11012_E' in i]
household_income = [i for i in allcolsLst if 'B19001_E' in i]
poverty_status_families = [i for i in allcolsLst if 'B17010_E' in i]

# Income variables: individuals
income_per_capita = [i for i in allcolsLst if 'B19301_E' in i]

# Income variables: housing units
median_hh_income = [i for i in allcolsLst if 'B19013_E' in i]
median_rental_value = [i for i in allcolsLst if 'B25064_E' in i]
median_property_value = [i for i in allcolsLst if 'B25077_E' in i]

# combining the above lists into single universe list:
population_univ = [age_distribution, school_enrollment, education_attainment, race, hisp, marital_Status, veteran_status, employment_status, mobility_metro, mobility_micro, mobility_not_msa, forecast_estimatesLst, [groupQuarters_population]]
housing_unit_univ = [occupancy_status, tenure, units_in_structure, year_structure_built, mortgage_status, avg_hh_size_of_occ_hu]
household_univ = [householdsType, households_byType, household_income, poverty_status_families]
monetary_variables = [income_per_capita, median_hh_income, median_rental_value, median_property_value]


# List of census varialbles - excluding base variables
population_univ = list(itertools.chain.from_iterable(population_univ))
housing_unit_univ = list(itertools.chain.from_iterable(housing_unit_univ))
monetary_variables = list(itertools.chain.from_iterable(monetary_variables))
household_univ = list(itertools.chain.from_iterable(household_univ))

# List of census varialbles - including base variables
population_univ_all = [total_population] + population_univ
housing_unit_univ_all = [housing_units] + housing_unit_univ

population_univ_all.sort()
housing_unit_univ_all.sort()
housing_unit_univ.sort()
monetary_variables.sort()

# MOE variables:
populationMOE_univ_all = [i.replace('_E', '_M') for i in population_univ_all]
housing_unitMOE_univ_all = [i.replace('_E', '_M') for i in housing_unit_univ_all]
householdMOE_univ = [i.replace('_E', '_M') for i in household_univ]

majorMOE_cols = populationMOE_univ_all + housing_unitMOE_univ_all + householdMOE_univ
majoruniv_cols = population_univ_all + housing_unit_univ_all + household_univ
monetary_moe_cols = [i.replace('_E', '_M') for i in monetary_variables]


# The function to aggregate the census variables:

def aggregate_census_data(census_data_collection, selected_censusBlocks, user_input=None):

  actualUserRequest = copy.copy(user_input)
  user_input = list(census_data_collection[0]['censusAttributes'].keys())

  # Step 1: Convert the bytes and string datatypes of Census blocks base variable data into desired datatypes:
  for collection in census_data_collection:
    block_data = collection['censusBlocks']
    key = tuple(json.loads(list(block_data.keys())[0]))
    value = np.frombuffer(base64.b64decode([i for i in block_data.values()][0])).reshape((-1, 3))
    # value = np.frombuffer([i for i in block_data.values()][0]).reshape((-1, 3))
    collection['censusBlocks'] = {key: value}

  # List of Census Block Broups (CBG) GeoIDs within the specified radius:
  selected_CBGs_ = set([i[:12] for i in selected_censusBlocks])


  # function to get total population, housing units, households of selected section of CBGs:
  def get_selectedBlocks_indexes_modified(censusBlock_dict_, CBG_id_func):
    cbg_key_array = np.array(list(censusBlock_dict_.keys())[0])
    values_ = list(censusBlock_dict_.values())[0]

    # getting base variables of blocks within the radius:
    mask_ = np.isin(cbg_key_array, np.asarray(selected_censusBlocks_CBG_dict[CBG_id_func]))
    values_ = values_[mask_]

    CBG_totalBaseVar_values = np.sum(values_, axis=0)
    return CBG_totalBaseVar_values

  # In order to reduce the time taken for CBG data filtering, we need the below dictionary:
  selected_censusBlocks_CBG_dict = {CBG: [] for CBG in selected_CBGs_}

  for censusBlock in selected_censusBlocks:
    CBG = censusBlock[:12]
    if CBG in selected_censusBlocks_CBG_dict:
      selected_censusBlocks_CBG_dict[CBG].append(censusBlock)


  # Step 2: Filter the documents:
  # filter only the CBG documents within user specified radius :
  CBG_lookup_dict = {CBG_doc['geoId']: CBG_doc for CBG_doc in census_data_collection}
  selected_CBG_collection_dict = {CBG_id:CBG_lookup_dict[CBG_id] for CBG_id in selected_CBGs_ if CBG_id in CBG_lookup_dict}
  # print('len of selected_CBG_collection_dict:', len(selected_CBG_collection_dict))


  error_moe = set([-666666666, -999999999, -888888888, -222222222, -333333333, -555555555, '*', '**', '***', None])

  # Step 3: Calculate the total estimates and MOE of the selected Census blocks within each CBG:
  #  and returning the values to selected_CBG_collection_dict's censusAttributes:

  for CBG_id, CBG_doc in selected_CBG_collection_dict.items():
    blocks_base_value_arr = get_selectedBlocks_indexes_modified(CBG_doc['censusBlocks'], CBG_id)
    CBG_totalvalues = np.asarray([CBG_doc['censusAttributes']['B01003_E001'],
                                  CBG_doc['censusAttributes']['B11001_E001'],
                                  CBG_doc['censusAttributes']['B25001_E001']])

    blocks_base_value_arr = blocks_base_value_arr / CBG_totalvalues

    pop_proportion = blocks_base_value_arr[0]
    hh_proportion = blocks_base_value_arr[1]
    hu_proportion = blocks_base_value_arr[2]

    pop_proportion_sqrt = sqrt(pop_proportion)
    hh_proportion_sqrt = sqrt(hh_proportion)
    hu_proportion_sqrt = sqrt(hu_proportion)

    # calculate the derived census variables using the above calculated proportion and base variables:
    # Leave the monetary variables as it is, as they are median values:
    # if pop_proportion!=0:
    for pop_var in population_univ_all:
      if pop_var in user_input:
        cbg_est = CBG_doc['censusAttributes'][pop_var]
        try:
          CBG_doc['censusAttributes'][pop_var] = cbg_est if cbg_est in error_moe else int(cbg_est * pop_proportion)
        except ValueError:
          CBG_doc['censusAttributes'][pop_var] = np.nan
      else:
        CBG_doc['censusAttributes'][pop_var] = np.nan

      pop_moeVar = pop_var.replace('_E', '_M')
      if pop_moeVar in user_input:
        cbg_moe = CBG_doc['censusAttributes'][pop_moeVar]
        try:
          CBG_doc['censusAttributes'][pop_moeVar] = cbg_moe if cbg_moe in error_moe else int(cbg_moe*pop_proportion_sqrt)
        except ValueError:
          CBG_doc['censusAttributes'][pop_moeVar] = np.nan
      else:
        CBG_doc['censusAttributes'][pop_moeVar] = np.nan

      
    # if hh_proportion!=0:
    for hh_var in household_univ:
      if hh_var in user_input:
        cbg_est = CBG_doc['censusAttributes'][hh_var]
        try:
          CBG_doc['censusAttributes'][hh_var] = cbg_est if cbg_est in error_moe else int(cbg_est * hh_proportion)
        except ValueError:
          CBG_doc['censusAttributes'][hh_var] = np.nan
      else:
        CBG_doc['censusAttributes'][hh_var] = np.nan

      hh_moeVar = hh_var.replace('_E', '_M')
      if hh_moeVar in user_input:
        cbg_moe = CBG_doc['censusAttributes'][hh_moeVar]
        try:
          CBG_doc['censusAttributes'][hh_moeVar] = cbg_moe if cbg_moe in error_moe else int(cbg_moe*hh_proportion_sqrt)
        except ValueError:
          CBG_doc['censusAttributes'][hh_moeVar] = np.nan
      else:
        CBG_doc['censusAttributes'][hh_moeVar] = np.nan


    # if hu_proportion!=0:
    for hu_var in housing_unit_univ:
      if hu_var in user_input:
        cbg_est = CBG_doc['censusAttributes'][hu_var]
        try:
          CBG_doc['censusAttributes'][hu_var] = cbg_est if cbg_est in error_moe else int(cbg_est * hu_proportion)
        except ValueError:
          CBG_doc['censusAttributes'][hu_var] = np.nan
      else:
        CBG_doc['censusAttributes'][hu_var] = np.nan

      hu_moeVar = hu_var.replace('_E', '_M')
      if hu_moeVar in user_input:
        cbg_moe = CBG_doc['censusAttributes'][hu_moeVar]
        try:
          CBG_doc['censusAttributes'][hu_moeVar] = cbg_moe if cbg_moe in error_moe else int(cbg_moe*hu_proportion_sqrt)
        except ValueError:
          CBG_doc['censusAttributes'][hu_moeVar] = np.nan
      else:
        CBG_doc['censusAttributes'][hu_moeVar] = np.nan

  inner_arrays = [np.array(list(val['censusAttributes'].values())) for val in selected_CBG_collection_dict.values()]
  census_value_arr = np.array(inner_arrays)

  # Step 4: Calculate the Total estimates and MOE for the selected market:

  # Functions to aggregate/approximate the census variables:
  def sum_column(col_indx):
    resultsum = np.nansum(census_value_arr[:, col_indx], axis=0)
    if pd.isna(resultsum):
      return 0
    return int(resultsum)

  def approx_moe_column(col_indx):
    Moe_col = census_value_arr[:, col_indx]
    arr_float = np.array(Moe_col, dtype=float)
    arr_float[arr_float == None] = np.nan
    sum_of_squares = np.nansum(arr_float[arr_float >= 0] ** 2)
    resultMoe = np.sqrt(sum_of_squares)
    if pd.isna(resultMoe):
      return 0
    return int(resultMoe)

  '''
  def approx_income_moe_column(col_indx, weight_):
    incMoe_col = census_value_arr[:, col_indx]
    incMoe_col = incMoe_col.astype(float)
    mask = (incMoe_col >= 0) & (~np.isnan(incMoe_col))

    incMoe_filtered = incMoe_col[mask]
    resultMoe = np.sqrt(np.sum(weight_ * (incMoe_filtered ** 2)))
    if pd.isna(resultMoe):
      return 0
    return int(resultMoe)
  '''
  
  
  # Since the calculate of MOE for income columns is very high, we are working on an alternative solution to approximate the MOE:
  # For now we provide the Highest MOE in the selected income column:
  # 12-July-2023
  def approx_income_moe_column(col_indx, weight_):
    incMoe_col = census_value_arr[:, col_indx]
    incMoe_col = incMoe_col.astype(float)
    mask = (incMoe_col >= 0) & (~np.isnan(incMoe_col))
    incMoe_filtered = incMoe_col[mask]
    max_moe = np.max(incMoe_filtered)
    if pd.isna(max_moe):
      return 0
    return int(max_moe)      
      

  def income_wgt_avg(col_indx):
    income_column = census_value_arr[:, col_indx]
    # to remove the uncomputed values
    income_column_float = income_column.astype(float)
    mask = (income_column_float >= 0) & (~np.isnan(income_column_float))
    income_column_filtered = income_column_float[mask]

    total_population_col_filtered = total_population_col[mask]
    if np.any(total_population_col_filtered):
      weighted_avg = np.average(income_column_filtered, weights=total_population_col_filtered)
    else:
      return 0
    if pd.isna(weighted_avg):
      return 0
    return int(weighted_avg)
    
    


  # Get the final output in form of dictionary:
  output_dict = dict()
  totalPop_idx = user_input.index('B01003_E001')
  total_population_col = census_value_arr[:, totalPop_idx]
  # print('total_population_col: ', total_population_col)

  for i in range(len(user_input)):
    col = user_input[i]

    if col in majoruniv_cols:
      value = sum_column(i)

    elif col in monetary_variables:
      value = income_wgt_avg(i)

    elif col in majorMOE_cols:
      value = approx_moe_column(i)

    elif col in monetary_moe_cols:
      weight = output_dict[col.replace('_M', '_E')]
      value = approx_income_moe_column(i, weight)

    output_dict[col] = value


  if actualUserRequest:
    final_output = dict()
    for key in actualUserRequest:
      final_output[key] = output_dict[key]
  else:
    final_output = output_dict

  final_output = dict(sorted(final_output.items()))

  return final_output



## For Direct Execution as a script:
if __name__ == "__main__":
    
    # Command Line Usage:
    # 1) If user queries for any selected census variables:
    #    $ python census_aggregator.py file1.txt file2.txt
    
    # 2) If user requests for all census variables:
    #    $ python census_aggregator.py file1.txt file2.txt file3.txt
    
    
    parser = argparse.ArgumentParser(description="US Census Aggregator Function")
    parser.add_argument("file1", type=str, help="Path to the file containing Census block group documents within the radius")
    parser.add_argument("file2", type=str, help="Path to the file with Census block geoids within the radius")
    parser.add_argument("file3", type=str, nargs="?", help="Path to optional third file with user queried census variables")

    args = parser.parse_args()
    
    # Read data from text files
    with open(args.file1, 'r') as file:
        # file1_data = eval(file.read())
        file1_data = json.loads(file.read()) # Note: if this line fails, please use the above line.
        
    with open(args.file2, 'r') as file:
        file2_data = file.read().split('|')
    
    file3_data = None
    if args.file3:
        with open(args.file3, 'r') as file:
            file3_data = file.read().split('|')

    # Pass the data to the function
    output = aggregate_census_data(file1_data, file2_data, file3_data)
    
    
    # sys.stdout.write(json.dumps(output))
    print(json.dumps(output))


