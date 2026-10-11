from app.utils.verifyMacros import hydrate_plans
from mock_test_data import *
from app.models.outputModels import GeminiOutput
import json
import pytest
from pydantic import ValidationError

def normalize(obj):
    """Strip defaultdict/other dict subclasses down to plain dict/list."""
    return json.loads(json.dumps(obj))

def test_hydrate_plans():
    regional = FOOD_CATALOG

    # test 1 : normal gemini output 
    assert normalize(hydrate_plans(GeminiOutput(**TEST_1_INPUT), regional)) == TEST_1_EXPECTED

    # test 3 : unknown food id, plan dropped
    assert normalize(hydrate_plans(GeminiOutput(**TEST_3_INPUT), regional)) == TEST_3_EXPECTED

    # test 4 : negative amount, rejected by pydantic
    with pytest.raises(ValidationError, match="greater than 0"):
        GeminiOutput(**TEST_4_INPUT)



    