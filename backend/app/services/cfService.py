import json 
import cloudflare

def get_list(cloudflare:cloudflare.Cloudflare, region:str, cl_account_id:str, cl_namespace_id:str, supabase):
    try: 
        regional_list = cloudflare.kv.namespaces.values.get(f"r-{region}", account_id=cl_account_id, namespace_id=cl_namespace_id)
        regional_list = json.loads(regional_list.read())
        print("RETRIEVED FROM CACHE")
        return regional_list
    
    except: 
        # get the regional list and put it into the kv 
        regional = supabase.table('FoodItems').select("id, name, protein, carbs, fat, calories, fibre").or_(f'region.eq.GLOBAL,region.eq.{region}').execute().data
        reg_str = json.dumps(regional)
        print("PUT THE KEY IN CACHE")
        put_key_in_kv(f"r-{region}", reg_str.encode(), cloudflare, cl_account_id, cl_namespace_id)
        return regional

def put_key_in_kv(key, val, cloudflare, cl_account_id:str, cl_namespace_id:str):
    try:
        cloudflare.kv.namespaces.values.update(key, account_id=cl_account_id, namespace_id=cl_namespace_id, value=val)
    except Exception as e:
        print("Unable to put key in kv", e)