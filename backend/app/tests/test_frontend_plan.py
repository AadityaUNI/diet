from app.models.mealModels import SavedPlan
from app.utils.analyzeUtils import frontend_plan 
from mock_frontend_plan_data import *

def test_frontend_plan():
    # same number of meals, ingredient changes 
    assert frontend_plan(SavedPlan(**ORIGINAL_1), HYDRATED, USER_ID) == EXPECTED_1

    # more meals, plus ingredient changes 
    assert frontend_plan(SavedPlan(**ORIGINAL_2), HYDRATED, USER_ID) == EXPECTED_2

    # less meals, plus ingredient changes
    assert frontend_plan(SavedPlan(**ORIGINAL_3), HYDRATED, USER_ID) == EXPECTED_3
