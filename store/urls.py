from django.conf.urls import patterns, include, url
from tastypie.api import Api
from store.api import ProductsResource, CategoriesResource

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

v1_api = Api(api_name='v1')
v1_api.register(ProductsResource())
v1_api.register(CategoriesResource())

urlpatterns = patterns('',
    # API
    url(r'^api/', include(v1_api.urls)),
    
    # Homepage
    url(r'^$', 'store.views.home', name='home'),    
)
