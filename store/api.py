from tastypie import fields
from tastypie.resources import ModelResource
from store.models import Customers, Products, Categories

class CustomersResource(ModelResource):
  class Meta:
    queryset = Customers.objects.all()
    resource_name = 'customers'
    excludes = ['email', 'password', 'creditcard', 'creditcardtype', 'creditcardexpiration', 'income']
    allowed_methods = ['get']

class CategoriesResource(ModelResource):
  class Meta:
    queryset = Categories.objects.all()
    resource_name = 'categories'

class ProductsResource(ModelResource):
  #category = fields.ForeignKey(CategoriesResource, 'category')
  #category = fields.ToOneField(CategoriesResource, 'category')
  
  class Meta:
    queryset = Products.objects.all()
    resource_name = 'products'
