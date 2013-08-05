from tastypie import fields
from tastypie.resources import ModelResource
from tastypie.paginator import Paginator
from store.models import Customers, Products, Categories

class CustomersResource(ModelResource):
  class Meta:
    queryset = Customers.objects.all()
    resource_name = 'customers'
    excludes = ['email', 'password', 'creditcard', 'creditcardtype', 'creditcardexpiration', 'income']
    allowed_methods = ['get']
    ordering = Customers._meta.get_all_field_names()

class CategoriesResource(ModelResource):
  class Meta:
    queryset = Categories.objects.all()
    resource_name = 'categories'
    ordering = Categories._meta.get_all_field_names()

class ProductsResource(ModelResource):
  #category = fields.ForeignKey(CategoriesResource, 'category')
  #category = fields.ToOneField(CategoriesResource, 'category')
  
  class Meta:
    queryset = Products.objects.all()
    resource_name = 'products'
    paginator_class = Paginator
    ordering = Products._meta.get_all_field_names()
